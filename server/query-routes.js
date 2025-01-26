var express = require("express");
var router = express.Router();
var { MongoClient } = require("mongodb");
var async = require("async");
var queryCache = require("./query-cache");
var auth = require("./auth");

var connect = async function() {
  let client = new MongoClient("mongodb://localhost/seismo");
  try {
    await client.connect();
    return client;
  } catch(e) {
    console.error(e);
  }
};

router.get("/stations", async function(req, res, next) {
  let client
  try {
    client = await connect();
    let stations = await client.db().collection("stations").find({}).toArray();
    res.send(stations);
  } catch(err) {
    next(err);
  }
  
  if (client) {
    client.close();
  }
});

//
// The /file/:filename route is only used when a user navigates directly
// to seismo.redfish.com/#/view/some_image_name.png.
//
router.get("/file/:filename", async function(req, res, next) {
  let client
  
  try {
    client = await connect();
    var filename = req.params.filename;
    let files = await client.db().collection("files").find({name: filename}).toArray();

    if (files.length > 0) {
      res.status(200).send(files[0]);
    } else {
      res.status(404).send("Not Found");
    }
  } catch(err) {
    next(err);
  }
  
  if (client) {
    client.close();
  }
});

//
// The /files route returns the first page of files that satisfy a query,
// as well as stats about the entire collection of files that satisfy
// that query. It gets hit when the page loads and when the user
// clicks the "Find Sesimograms" button.
//
router.get("/files", async function(req, res, next) {
  let client
  try {
    console.log("--- processing files query ---", req.query);
    var hit = queryCache.hit(req.query);
    if (hit) {
      console.log("result is cached");
      res.send(hit);
      return;
    }
    
    var query = constructMongoQuery(req);

    // result paging
    var page = parseInt(req.query.page) || 1;
    var pageSize = 20;

    client = await connect();
    var db = client.db();
    let results = await async.parallel({
      filteredFiles: async function(cb) {
        console.time("filteredFiles");
        let filteredFiles = await db.collection("files")
          .find(query)
          .skip(pageSize * (page-1))
          .limit(pageSize)
          .toArray();

        console.timeEnd("filteredFiles")
        return filteredFiles;
      },
      numResults: async function(cb) {
        console.time("numResults");
        var fileCursor = db.collection("files").find(query).batchSize(10000);
        let numResults = await fileCursor.count();
        console.timeEnd("numResults");
        return numResults;
      },
      lowDate: async function(cb) {
        let files = await db.collection("files").find(query).sort({date:1}).limit(1).toArray();
        var date = files.length > 0 ? files[0].date : null;
        return date;
      },
      highDate: async function(cb) {
        let files = await db.collection("files").find(query).sort({date:-1}).limit(1).toArray();
        var date = files.length > 0 ? files[0].date : null;
        return date;
      },
      counts: async function(cb) {
        console.time("processing");

        var stationMap = {};

        let cursor = db.collection("files").find(query, {batchSize: 10000})
        
        for await (const file of cursor) {
          if (!(file.stationId in stationMap)) {
            stationMap[file.stationId] = 0;
          }
          stationMap[file.stationId]++;
        }

        console.timeEnd("processing");
        return { stationMap: stationMap };
      }
    });
    
    var payload = {
      stations: results.counts.stationMap,
      lowDate: results.lowDate,
      highDate: results.highDate,
      numResults: results.numResults,
      files: results.filteredFiles
    };

    queryCache.put(req.query, payload);
    res.send(payload);
  } catch(err) {
    next(err);
  }  

  if (client) {
    client.close();
  }
});

//
// The /morefiles route is used to load subsequent pages of file results.
// It gets hit when the user scrolls to the bottom of the currently
// rendered results in the browser.
//
router.get("/morefiles", async function(req, res, next) {
  let client
  try {
    console.log("--- processing morefiles query ---", req.query);

    var query = constructMongoQuery(req);

    // result paging
    var page = parseInt(req.query.page) || 1;
    var pageSize = 20;

    client = await connect();
    
    console.time("filteredFiles");
    let filteredFiles = await client.db().collection("files")
      .find(query)
      .skip(pageSize * (page-1))
      .limit(pageSize)
      .toArray();
    console.timeEnd("filteredFiles");

    res.send({ files: filteredFiles });  
  } catch(err) {
    next(err);
  }

  if (client) {
    client.close();
  }
});

function constructMongoQuery(req) {
  var edited = req.query.edited;
  var dateFrom = new Date(req.query.dateFrom);
  var dateTo = new Date(req.query.dateTo);

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

  return query;
}

module.exports = router;
