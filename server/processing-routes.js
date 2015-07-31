var router = require("express").Router();
var mongo = require("mongodb").MongoClient;
var async = require("async");
var fs = require("fs");
var exec = require("child_process").exec;
var mktemp = require("mktemp");

var queryCache = require("./query-cache");
var statusSocket = require("./status-socket");
var escape = require("./util").escape;
var status = require("./status");

var pipelinePath = __dirname + "/../../seismogram-pipeline";

var connect = function(cb) {
  mongo.connect("mongodb://localhost/seismo", cb);
};

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

router.post("/assign", function(req, res) {
  var segments = req.body.segments;
  var meanlines = req.body.meanlines;
  var path = mktemp.createDirSync("/tmp/seismo-assign.XXXXX");

  fs.writeFileSync(path + "/segments.json", segments);
  fs.writeFileSync(path + "/meanlines.json", meanlines);

  var command = "python get_segment_assignments.py " +
    "--segments " + path + "/segments.json " +
    "--meanlines " + path + "/meanlines.json " +
    "--output " + path + "/assignments.json";

  process.chdir(pipelinePath);

  exec(command, function(err, stdout, stderr) {
    if (err) {
      res.status(503).send({
        stdout: stdout,
        stderr: stderr
      });
    } else {
      var assign = fs.readFileSync(path + "/assignments.json");
      res.send(assign);
    }
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
          var filePath = path + "/" + layer.key + ".json";
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
