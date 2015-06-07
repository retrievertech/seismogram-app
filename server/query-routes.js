var express = require("express");
var router = express.Router();
var mongo = require("mongodb").MongoClient;
var async = require("async");
var HistogramTool = require("./histogram-tool");
var queryCache = require("./query-cache");

var connect = function(cb) {
  mongo.connect("mongodb://localhost/seismo", cb);
};

var histogramTool;
function prepareHistogramTool() {
  async.waterfall([
    connect,
    function(db, cb) {
      db.collection("files").find()
        .sort({date: 1})
        .limit(1)
        .toArray(function(err, files) {
          var lowDate = files[0].date;
          cb(err, db, lowDate);
        });
    },
    function(db, lowDate, cb) {
      db.collection("files").find()
        .sort({date: -1})
        .limit(1)
        .toArray(function(err, files) {
          var highDate = files[0].date;
          cb(err, db, lowDate, highDate);
        });
    },
    function(db, lowDate, highDate, cb) {
      histogramTool = new HistogramTool(lowDate, highDate);
      db.close();
    }
  ], function(err) {
    if (err) console.error(err);
  });
}
prepareHistogramTool();

router.get("/stations", function(req, res, next) {
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

router.get("/files", function(req, res, next) {
  console.log("--- processing files query ---", req.query);
  var hit = queryCache.hit(req.query);
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

  var fileNames = [];
  if (req.query.fileNames) {
    req.query.fileNames.split(",").reduce(function(acc, fileName) {
      try {
        acc.push(new RegExp(fileName.trim()));
      } catch (e) {
        console.log("bad file name regexp", e);
      }
      return acc;
    }, fileNames);
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

  // prepare histogramTool for binning
  var numBins = parseInt(req.query.bins) || 200;
  histogramTool.setNumBins(numBins);

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
  if (edited) {
    var editedValue = JSON.parse(edited);
    if (editedValue)
      queryComponents.push({edited: editedValue});
  }
  // station Ids to match
  if (stationIds.length > 0) queryComponents.push({stationId: {$in: stationIds}});
  // statuses
  queryComponents.push({status: {$in: status}});

  if (fileNames.length > 0) queryComponents.push({name: {$in: fileNames}});

  // final query
  var query = {};
  if (queryComponents.length > 0) query.$and = queryComponents;
  console.log("query =", JSON.stringify(query, null, 2));

  async.waterfall([
    connect,
    function(db, cb) {
      async.parallel({
        filteredFiles: function(cb) {
          console.time("filteredFiles");
          db.collection("files")
            .find(query)
            .skip(pageSize * (page-1))
            .limit(pageSize)
            .toArray(function(err, filteredFiles) {
              console.timeEnd("filteredFiles");
              cb(err, filteredFiles);
            });
        },
        numResults: function(cb) {
          console.time("numResults");
          var fileCursor = db.collection("files").find(query).batchSize(10000);
          fileCursor.count(function(err, numResults) {
            console.timeEnd("numResults");
            cb(err, numResults);
          });
        },
        lowDate: function(cb) {
          db.collection("files").find(query).sort({date:1}).limit(1).toArray(function(err, files) {
            var date = files.length > 0 ? files[0].date : null;
            cb(err, date);
          });
        },
        highDate: function(cb) {
          db.collection("files").find(query).sort({date:-1}).limit(1).toArray(function(err, files) {
            var date = files.length > 0 ? files[0].date : null;
            cb(err, date);
          });
        },
        counts: function(cb) {
          console.time("processing");

          var stationMap = {};
          var histogram = {};

          var getStation = function(id) {
            if (!(id in stationMap)) {
              stationMap[id] = {
                status: [0,0,0,0],
                edited: 0
              };
            }
            return stationMap[id];
          };

          db.collection("files").find(query).batchSize(10000).each(function(err, file) {
            if (file === null) {
              console.timeEnd("processing");
              cb(err, { stationMap: stationMap, histogram: histogram });
            } else {
              var station = getStation(file.stationId);

              if (!station) {
                console.error(file.stationId, "does not exist");
                return;
              }

              station.status[file.status]++;
              station.edited += +file.edited;

              var date = new Date(file.date),
                  binIdx = histogramTool.getBinIdx(date);
              
              if (!(binIdx in histogram)) {
                histogram[binIdx] = 0;
              }

              histogram[binIdx]++;
            }
          });
        }
      },
      function(err, results) {
        cb(err, db, results);
      });
    },
    function(db, results, cb) {
      var payload = {
        stations: results.counts.stationMap,
        lowDate: results.lowDate,
        highDate: results.highDate,
        numResults: results.numResults,
        histogram: results.counts.histogram,
        files: results.filteredFiles,
        numBins: numBins
      };

      queryCache.put(req.query, payload);
      res.send(payload);
      db.close();
      cb(null);
    }
  ], function(err) {
    if (err) next(err);
  });
});

module.exports = router;
