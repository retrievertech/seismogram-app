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
        cb(err, files, stations);
      });
    },
    function(files, stations, cb) {
      var stationMap = {};
      stations.forEach(function(station) {
        stationMap[station.stationId] = station;
        station.completed = 0;
        station.inProgress = 0;
        station.notStarted = 0;
        station.needsAttention = 0;
        station.edited = 0;
      });
      files.forEach(function(file) {
        var station = stationMap[file.stationId];
        if (!station) console.error(file.stationId, "does not exist");
        if (file.status === 0 || typeof(file.status) === "undefined") station.notStarted++;
        if (file.status === 1) station.inProgress++;
        if (file.status === 2) station.needsAttention++;
        if (file.status === 3) station.completed++;
        if (file.edited) station.edited++;
      });
      var filteredFiles = files.splice(pageSize*(page-1), pageSize);
      res.send({
        stations: stations,
        numResults: files.length,
        files: filteredFiles
      });
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
