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
var auth = require("./auth");

var pipelinePath = __dirname + "/../../seismogram-pipeline";

var connect = function(cb) {
  mongo.connect("mongodb://localhost/seismo", cb);
};

function setStatus(filename, status, callback) {
  async.waterfall([
    connect,
    function(client, cb) {
      client.db().collection("files").update({
        name: filename
      }, {
        $set: { status: status }
      }, function(err, result) {
        cb(err, client, result);
      });
    },
    function(client, result) {
      client.close();

      if (result === 1) {
        statusSocket.broadcast("status-update", {
          filename: filename,
          status: status
        });

        queryCache.invalidate();
      }

      if (typeof callback === "function")
        callback(null, result);
    }
  ], function(err) {
    if (typeof callback === "function")
      callback(err);
  });
}

router.get("/setstatus/:filename/:status", auth, function(req, res, next) {
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

  // change this if not using conda to manage your python environment
  var pythonCommand = "conda run -n seismo python"
  
  var command = pythonCommand + " get_segment_assignments.py " +
    "--segments " + path + "/segments.json " +
    "--meanlines " + path + "/meanlines.json " +
    "--output " + path + "/assignments.json";

  process.chdir(pipelinePath);

  console.time("running assignment...");
  exec(command, {maxBuffer: 1024 * 1000}, function(err, stdout, stderr) {
    if (err) {
      console.log(stdout);
      console.log(stderr);
      res.status(503).send({error: err.message});
    } else {
      console.timeEnd("running assignment...");
      var assign = fs.readFileSync(path + "/assignments.json");
      res.send(assign);
    }
  });
});

router.post("/save/:filename", auth, function(req, res, next) {
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
      var command = "sh copy_to_s3.sh " + filename + " " + escape(path) + " edited-metadata";
      if (process.env.NODE_ENV !== "production") {
        command += " dev";
      }
      console.log(`Executing ${command}`);
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
