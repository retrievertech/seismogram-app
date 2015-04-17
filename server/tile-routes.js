var express = require("express"),
    router = express.Router();

var Tiler = require("./tiler"),
    fs = require("fs");

var exec = require("child_process").exec;

var cache = require("./cache");

var tiler = new Tiler();

function localPath(filename) {
  return __dirname + "/local-file-cache/" + filename;
}

function getFile(filename, cb) {
  console.log("getFile", filename);
  var path = localPath(filename);

  if (fs.existsSync(path)) {
    console.log("--> on local disk");
    cb(null);
  } else {
    console.log("--> *not* on local disk");
    console.time("s3fetch");
    if (!loading[filename]) {
      loading[filename] = [];
      exec("aws s3 cp s3://WWSSN_Scans/" + filename + " --region us-east-1 " + path, function(err) {
        console.timeEnd("s3fetch");
        console.log("processing", loading[filename].length, "requests");
        loading[filename].forEach(function(cb) { cb(err); });
        delete loading[filename];
      });
    }
    console.log("buffering request");
    loading[filename].push(cb);
  }
}

var loading = {};

router.get("/:filename/:z/:x/:y.png", function(req, res) {

  console.log("--- processing /tile ---", req.params);

  var filename = process.env.NODE_ENV === "production" ? req.params.filename : "dummy-seismo.png";

  getFile(filename, function(err) {
    var z = req.params.z,
        x = req.params.x,
        y = req.params.y,
        tile;

    var img = cache.hit(filename);

    console.time("makeTile");
    tile = tiler.createTile(img, z, x, y);
    console.timeEnd("makeTile");

    respondWithTile(tile, res);
  });
});

function respondWithTile(tile, res) {
  var tileAsBuffer = tile.toBuffer();
  res.set({
    "Content-Type": "image/png",
    "Content-Length": tileAsBuffer.length,
    "Access-Control-Allow-Origin": "*",
    "ETag": new Date()
  });
  res.end(tileAsBuffer);
}

module.exports = router;
