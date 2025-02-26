var router = require("express").Router();
var { MongoClient } = require("mongodb");
var async = require("async");
var fs = require("fs");
var fsPromises = require("node:fs/promises");
var exec = require("child_process").exec;
var mktemp = require("mktemp");

var queryCache = require("./query-cache");
var statusSocket = require("./status-socket");
var escape = require("./util").escape;
var status = require("./status");
var auth = require("./auth");

var pipelinePath = __dirname + "/../../seismogram-pipeline";

var connect = async function() {
  let client = new MongoClient("mongodb://localhost/seismo");
  try {
    await client.connect();
    return client;
  } catch(e) {
    console.error(e);
  }
};

async function setStatus(filename, status) {
  let client = await connect();
  let result = await client.db().collection("files").updateOne({ name: filename }, { $set: { status: status } });

  if (result.modifiedCount === 1) {
    statusSocket.broadcast("status-update", {
      filename: filename,
      status: status
    });

    queryCache.invalidate();
  }
  
  if (client) {
    client.close();
  }

  return result
}

router.get("/setstatus/:filename/:status", auth, async function(req, res, next) {
  var status = parseInt(req.params.status);
  var filename = req.params.filename;

  try {
    let result = await setStatus(filename, status);
    res.send({ ok: result.modifiedCount === 1 });
  } catch(err) {
    next(err);
  }
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
  exec(command, { maxBuffer: 1024 * 1000 }, function(err, stdout, stderr) {
    if (err) {
      console.log(stdout);
      console.log(stderr);
      res.status(503).send({ error: err.message });
    } else {
      console.timeEnd("running assignment...");
      var assign = fs.readFileSync(path + "/assignments.json");
      res.send(assign);
    }
  });
});

router.post("/save/:filename", auth, async function(req, res, next) {
  var filename = req.params.filename;
  var layers = req.body.layers;

  var path = mktemp.createDirSync("/tmp/seismo-save.XXXX");

  try {
    console.log("Writing metadata jsons...")
    var writeMetadataFiles = layers.map((layer) => {
      var filePath = path + "/" + layer.key + ".json";
      return fsPromises.writeFile(filePath, layer.contents);
    });

    await Promise.all(writeMetadataFiles);  
  } catch(err) {
    console.log(err);
  }

  process.chdir(pipelinePath);
  var command = "sh copy_to_s3.sh " + filename + " " + escape(path) + " wwssn-edited-metadata";
  if (process.env.NODE_ENV !== "production") {
    command += " dev";
  }
  console.log(`Executing ${command}`);
  exec(command, (stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.log(stderr);
    res.send({ ok: 1 });
    setStatus(filename, status.edited);  
  });
});

module.exports = router;