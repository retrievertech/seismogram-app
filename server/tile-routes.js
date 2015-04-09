var express = require("express"),
    router = express.Router();

var Image = require("canvas").Image,
    Tiler = require("./tiler"),
    fs = require("fs");

var tiler = new Tiler();
var cache = {};

router.get("/:filename/:z/:x/:y.png", function(req, res) {

  console.log("--- processing /tile ---", req.params);

  var filename = req.params.filename,
      z = req.params.z,
      x = req.params.x,
      y = req.params.y,
      tile;
  
  // For the time being, always return tiles from a dummy seismogram.
  // The dummy is actually 0051574_0615_0124_04.png.
  var filename = "dummy-seismo.png";

  if (!cache[filename]) {
    console.time("readFile");
    var file = fs.readFileSync(__dirname + "/" + filename);
    console.timeEnd("readFile");
    
    console.time("convertToImage");
    var img = new Image();
    img.src = file;
    console.timeEnd("convertToImage");
    
    cache[filename] = img;
  }

  console.time("makeTile");
  tile = tiler.createTile(cache[filename], z, x, y);
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
