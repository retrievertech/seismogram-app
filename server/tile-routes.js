var router = require("express").Router();
var Tiler = require("./tiler");
var imageCache = require("./image-cache");
var diskCache = require("./disk-cache");
var auth = require("./auth");

var tiler = new Tiler();

router.get("/:filename/:z/:x/:y.png", auth, function(req, res) {

  console.log("--- processing /tile ---", req.params);

  var filename = req.params.filename;

  diskCache.ensureFileIsLocal(filename, function(err) {
    var z = req.params.z,
        x = req.params.x,
        y = req.params.y,
        tile;

    var img = imageCache.hit(filename);

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
