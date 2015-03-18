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

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at %s:%s", host, port);
});
