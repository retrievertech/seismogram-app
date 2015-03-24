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

var cache = {};
var cacheKey = function(query) {
  return query.status + "_" + query.edited + "_" + query.dateFrom + "_" + query.dateTo + "_" + query.page;
};
var cacheHit = function(query) {
  return cache[cacheKey(query)];
};
var cachePut = function(query, payload) {
  var key = cacheKey(query);
  console.log("put", key);
  cache[key] = payload;
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
  var hit = cacheHit(req.query);
  if (hit) {
    res.send(hit);
    return;
  }
  var status = req.query.status;
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
  // status bit
  if (status) queryComponents.push({status: JSON.parse(status)});
  // station Ids to match
  if (stationIds.length > 0) queryComponents.push({stationId: {$in: stationIds}});

  // final query
  var query = {};
  if (queryComponents.length > 0) query.$and = queryComponents;
  console.log(JSON.stringify(query, null, 2));

  async.waterfall([
    connect,
    // run the query on the files collection
    function(db, cb) {
      db.collection("files")
        .find(query)
        //.skip(pageSize * (page-1))
        //.limit(pageSize)
        .toArray(function(err, files) {
          cb(err, db, files);
        });
    },
    // get all the stations
    function(db, files, cb) {
      db.collection("stations").find({}).toArray(function(err, stations) {
        cb(err, db, files, stations);
      });
    },
    // get all the statuses
    function(db, files, stations, cb) {
      db.collection("statuses").find({}).toArray(function(err, statuses) {
        cb(err, files, stations, statuses);
      });
    },
    function(files, stations, statuses, cb) {
      var stationMap = {};
      var getStation = function(id) {
        if (!(id in stationMap)) {
          stationMap[id] = {
            completed: 0,
            inProgress: 0,
            notStarted: 0,
            needsAttention: 0,
            edited: 0
          };
        }
        return stationMap[id];
      };
      var statusMap = {};
      statuses.forEach(function(status) {
        statusMap[status.fileName] = status;
      });
      files.forEach(function(file) {
        var station = getStation(file.stationId);
        var statusObj = statusMap[file.name];
        if (!station) console.error(file.stationId, "does not exist");
        if (!statusObj) console.error(file.name, "has no status");
        if (statusObj.status === 0) station.notStarted++;
        if (statusObj.status === 1) station.inProgress++;
        if (statusObj.status === 2) station.needsAttention++;
        if (statusObj.status === 3) station.completed++;
        if (statusObj.edited) station.edited++;
        file.status = statusObj.status;
        file.edited = statusObj.edited;
      });
      var filteredFiles = files.splice(pageSize*(page-1), pageSize);
      var payload = {
        stations: stationMap,
        numResults: files.length,
        files: filteredFiles
      };
      cachePut(req.query, payload);
      res.send(payload);
      cb(null);
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
