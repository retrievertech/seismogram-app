var router = require("express").Router();
var Tiler = require("./tiler");
var cache = require("./cache");
var diskCache = require("./disk-cache");

var tiler = new Tiler();

router.get("/:filename/:z/:x/:y.png", function(req, res) {

  console.log("--- processing /tile ---", req.params);

  var filename = process.env.NODE_ENV === "production" ? req.params.filename : "dummy-seismo.png";

  diskCache.ensureFileIsLocal(filename, function(err) {
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
