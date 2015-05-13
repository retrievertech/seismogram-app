var router = require("express").Router();
var mongo = require("mongodb").MongoClient;
var async = require("async");
var exec = require("child_process").exec;
var diskCache = require("./disk-cache");
var queryCache = require("./query-cache");

var pipelinePath = __dirname + "/../../seismogram-pipeline";

var connect = function(cb) {
  mongo.connect("mongodb://localhost/seismo", cb);
};

router.get("/start/:filename", function(req, res) {
  var filename = req.params.filename;
  var path = diskCache.localPath(filename);

  // return immediately
  res.send({ ok: 1 });

  diskCache.ensureFileIsLocal(filename, function() {
    process.chdir(pipelinePath);

    exec("sh get_all_metadata_s3.sh " + filename + " " + path, function(err) {
      if (err) {
        console.log("script run failure", err);
      }
    });
  });
});

router.get("/setstatus/:filename/:status", function(req, res, next) {
  var status = parseInt(req.params.status);
  console.log("set status", req.params.filename, status);

  async.waterfall([
    connect,
    function(db, cb) {
      db.collection("files").update({
        name: req.params.filename
      }, {
        $set: { status: status }
      }, function(err, result) {
        cb(err, db, result);
      });
    },
    function(db, result) {
      db.close();

      if (result === 1) {
        // update was successful
        // update the cached queries
        queryCache.forEachFile(function(file) {
          if (file.name === req.params.filename) {
            file.status = status;
          }
        });
      }

      res.send({ ok: result });
    }
  ], function(err) {
    if (err) next(err);
  });
});

module.exports = router;
