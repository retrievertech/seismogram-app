var express = require("express");
var async = require("async");
var cors = require("cors");
var mongo = require("mongodb").MongoClient;
var app = express();

app.use(cors());
app.use(function(err, req, res, next) {
  console.error(err);
  next(err);
});

var connect = function(cb) {
  mongo.connect("mongodb://localhost/seismo", cb);
};

var cache = {
  on: true,
  cache: {},
  key: function(query) {
    return query.status + "_" + query.edited + "_" + query.dateFrom + "_" + query.dateTo + "_" + query.page;
  },
  hit: function(query) {
    return this.on ? this.cache[this.key(query)] : null;
  },
  put: function(query, payload) {
    var key = this.key(query);
    this.cache[key] = payload;
  }
};

app.get("/stations", function(req, res, next) {
  async.waterfall([
    connect,
    function(db, cb) {
      var stations = db.collection("stations");
      stations.find({}).toArray(cb);
    },
    function(stations, cb) {
      res.send(stations);
      cb(null);
    }
  ], function(err) {
    if (err) next(err);
  });
});

app.get("/query", function(req, res, next) {
  console.log("--- processing /query ---", req.query);
  var hit = cache.hit(req.query);
  if (hit) {
    console.log("result is cached");
    res.send(hit);
    return;
  }
  var edited = req.query.edited;
  var dateFrom = new Date(req.query.dateFrom);
  var dateTo = new Date(req.query.dateTo);

  // result paging
  var page = parseInt(req.query.page) || 1;
  var pageSize = 40;

  // station ids to match. If no ids are provided, all ids are matched
  var stationIds = [];
  if (req.query.stationIds) {
    stationIds = req.query.stationIds.split(",").map(function(stationId) {
      return stationId.trim();
    });
  }

  var status = [];
  if (req.query.status) {
    status = req.query.status.split(",").reduce(function(acc, status) {
      var cleanedUpStatus = parseInt(status.trim());
      if (!isNaN(cleanedUpStatus)) {
        acc.push(cleanedUpStatus);
      }
      return acc;
    }, []);
  }

  // build the query.
  // queryComponents is a list of clauses that will be $and-ed together
  var queryComponents = [];

  // the date range
  var dateComponents = {};
  // the image date should be greater or equal to datFrom (lower bound)
  if (dateFrom.toString() !== "Invalid Date") dateComponents.$gte = dateFrom;
  // and less than or equal to dateTo (upper bound)
  if (dateTo.toString() !== "Invalid Date") dateComponents.$lte = dateTo;
  if (Object.keys(dateComponents).length > 0) queryComponents.push({date: dateComponents});

  // edited bit
  if (edited) queryComponents.push({edited: JSON.parse(edited)});
  // station Ids to match
  if (stationIds.length > 0) queryComponents.push({stationId: {$in: stationIds}});
  // statuses
  if (status.length > 0) queryComponents.push({status: {$in: status}});

  // final query
  var query = {};
  if (queryComponents.length > 0) query.$and = queryComponents;
  console.log("query =", JSON.stringify(query, null, 2));

  async.waterfall([
    connect,
    function(db, cb) {
      console.time("filteredFiles");
      db.collection("files").find(query).skip(pageSize * (page-1)).limit(pageSize).toArray(function(err, filteredFiles) {
        console.timeEnd("filteredFiles");
        cb(err, db, filteredFiles);
      });
    },
    function(db, filteredFiles, cb) {
      console.time("numResults");
      var fileCursor = db.collection("files").find(query).batchSize(10000);
      fileCursor.count(function(err, numResults) {
        console.timeEnd("numResults");
        cb(err, db, fileCursor, filteredFiles, numResults);
      });
    },
    function(db, fileCursor, filteredFiles, numResults, cb) {
      db.collection("files").find({}).sort({date:1}).limit(1).toArray(function(err, files) {
        cb(err, db, fileCursor, filteredFiles, numResults, files[0].date);
      });
    },
    function(db, fileCursor, filteredFiles, numResults, lowDate, cb) {
      db.collection("files").find({}).sort({date:-1}).limit(1).toArray(function(err, files) {
        cb(err, db, fileCursor, filteredFiles, numResults, lowDate, files[0].date);
      });
    },
    function(db, fileCursor, filteredFiles, numResults, lowDate, highDate, cb) {
      console.time("processing");
      var stationMap = {};
      var getStation = function(id) {
        if (!(id in stationMap)) {
          stationMap[id] = {
            status: [0,0,0,0],
            edited: 0
          };
        }
        return stationMap[id];
      };
      fileCursor.each(function(err, file) {
        if (file === null) {
          console.timeEnd("processing");
          var payload = {
            stations: stationMap,
            lowDate: lowDate,
            highDate: highDate,
            numResults: numResults,
            files: filteredFiles
          };
          cache.put(req.query, payload);
          res.send(payload);
          db.close();
          cb(null);
        } else {
          var station = getStation(file.stationId);
          if (!station) console.error(file.stationId, "does not exist");
          station.status[file.status]++;
          station.edited += +file.edited;
        }
      });

    }
  ], function(err) {
    if (err) next(err);
  });
});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at %s:%s", host, port);
});
