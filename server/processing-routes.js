var router = require("express").Router();
var mongo = require("mongodb").MongoClient;
var async = require("async");
var exec = require("child_process").exec;
var diskCache = require("./disk-cache");
var queryCache = require("./query-cache");
var statusSocket = require("./status-socket");
var escape = require("./util").escape;

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

    var command = "sh get_all_metadata_s3.sh " + filename + " " + escape(path);

    if (process.env.NODE_ENV !== "production") {
      command += " dev";
    }

    exec(command, function(err, stdout, stderr) {
      console.log("stdout:", stdout);
      console.log("stderr:", stderr);
      if (err) {
        console.log("processing error", err);
        setStatus(filename, 0);
      }
    });
  });
});

function setStatus(filename, status, callback) {
  async.waterfall([
    connect,
    function(db, cb) {
      db.collection("files").update({
        name: filename
      }, {
        $set: { status: status }
      }, function(err, result) {
        cb(err, db, result);
      });
    },
    function(db, result) {
      db.close();

      if (result === 1) {
        statusSocket.broadcast("status-update", {
          filename: filename,
          status: status
        });

        // update was successful
        // update the cached queries
        queryCache.forEachFile(function(file) {
          if (file.name === filename) {
            file.status = status;
          }
        });
      }

      if (typeof callback === "function")
        callback(null, result);
    }
  ], function(err) {
    if (typeof callback === "function")
      callback(err);
  });
}

router.get("/setstatus/:filename/:status", function(req, res, next) {
  var status = parseInt(req.params.status);
  var filename = req.params.filename;

  setStatus(filename, status, function(err, result) {
    if (err) next(err);
    else res.send({ ok: result });
  });
});

module.exports = router;
