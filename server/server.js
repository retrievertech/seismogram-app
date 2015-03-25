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
  return false;
  //return cache[cacheKey(query)];
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
      console.log(cleanedUpStatus);
      if (!isNaN(cleanedUpStatus)) {
        console.log("push");
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
  console.log(status);
  if (status.length > 0) queryComponents.push({status: {$in: status}});

  // final query
  var query = {};
  if (queryComponents.length > 0) query.$and = queryComponents;
  console.log(JSON.stringify(query, null, 2));

  async.waterfall([
    connect,
    // run the query on the files collection
    function(db, cb) {
      console.time("files");
      db.collection("files")
        .find(query)
        //.skip(pageSize * (page-1))
        //.limit(10000)
        .toArray(function(err, files) {
          console.timeEnd("files");
          cb(err, db, files);
        });
    },
    // get all the stations
    function(db, files, cb) {
      console.time("stations");
      db.collection("stations").find({}).toArray(function(err, stations) {
        console.timeEnd("stations");
        cb(err, db, files, stations);
      });
    },
    function(db, files, stations, cb) {
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
      console.time("processing");
      files.forEach(function(file) {
        var station = getStation(file.stationId);
        if (!station) console.error(file.stationId, "does not exist");
        station.status[file.status]++;
        station.edited += +file.edited;
      });
      console.timeEnd("processing");
      var numResults = files.length;
      var filteredFiles = files.splice(pageSize*(page-1), pageSize);
      var payload = {
        stations: stationMap,
        numResults: numResults,
        files: filteredFiles
      };
      cachePut(req.query, payload);
      res.send(payload);
      db.close();
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
