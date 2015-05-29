var router = require("express").Router();
var mongo = require("mongodb").MongoClient;
var async = require("async");
var fs = require("fs");
var exec = require("child_process").exec;
var mktemp = require("mktemp");

var diskCache = require("./disk-cache");
var queryCache = require("./query-cache");
var statusSocket = require("./status-socket");
var escape = require("./util").escape;
var status = require("./status");

var pipelinePath = __dirname + "/../../seismogram-pipeline";
var logPath = __dirname + "/../client/logs";

var connect = function(cb) {
  mongo.connect("mongodb://localhost/seismo", cb);
};

var writeLog = function(filename, logContents) {
  if (!fs.existsSync(logPath)) {
    fs.mkdirSync(logPath);
  }

  var path = logPath + "/" + filename + ".txt";

  fs.writeFile(path, logContents, function(err) {
    if (err) {
      console.log("error writing to log", filename, err);
    }
  });
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
      var log = "== stdout ==\n";
      log += stdout;
      log += "\n== stderr ==\n";
      log += stderr;

      if (err) {
        setStatus(filename, status.failed);
      }

      console.log(log);
      writeLog(filename, log);
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

router.post("/save/:filename", function(req, res, next) {
  var filename = req.params.filename;
  var layers = req.body.layers;
  async.waterfall([
    function(cb) {
      mktemp.createDir("/tmp/seismo-save.XXXX", cb);
    },
    function(path, cb) {
      var functions = layers.map(function(layer) {
        return function(callback) {
          var filePath = path + "/" + layer.key;
          fs.writeFile(filePath, layer.contents, callback);
        };
      });
      async.parallel(functions, function(err) {
        cb(err, path);
      });
    },
    function(path, cb) {
      process.chdir(pipelinePath);
      var command = "sh copy_to_s3.sh " + filename + " " + escape(path) + " edited";
      if (process.env.NODE_ENV !== "production") {
        command += " dev";
      }
      exec(command, cb);
    },
    function(stdout, stderr, cb) {
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      res.send({ ok: 1 });
      setStatus(filename, status.edited);
      cb(null);
    }
  ], function(err) {
    if (err) next(err);
  });
});

module.exports = router;
