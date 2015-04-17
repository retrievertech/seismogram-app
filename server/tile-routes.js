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

router.get("/loadfile/:filename", function(req, res) {
  if (process.env.NODE_ENV !== "production") {
    res.send({ success: true });
    return;
  }

  var filename = req.params.filename;
  var path = localPath(filename);

  console.log("requested file", filename);

  if (fs.existsSync(path)) {
    console.log("--> on local disk");
    res.send({ success: true });
  } else {
    console.log("--> *not* on local disk");
    console.time("s3fetch");
    exec("aws s3 cp s3://WWSSN_Scans/" + filename + " --region us-east-1 " + path, function(err) {
      console.timeEnd("s3fetch");
      res.send({ success: err === null });
    });
  }
});

router.get("/:filename/:z/:x/:y.png", function(req, res) {

  console.log("--- processing /tile ---", req.params);

  var filename = process.env.NODE_ENV === "production" ? req.params.filename : "dummy-seismo.png",
      z = req.params.z,
      x = req.params.x,
      y = req.params.y,
      tile;

  var img = cache.hit(filename);

  console.time("makeTile");
  tile = tiler.createTile(img, z, x, y);
  console.timeEnd("makeTile");

  respondWithTile(tile, res);
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
