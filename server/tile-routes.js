var router = require("express").Router();
var fs = require("fs");
var exec = require("child_process").exec;
var Tiler = require("./tiler");
var cache = require("./cache");

var tiler = new Tiler();

function localPath(filename) {
  return __dirname + "/local-file-cache/" + filename;
}

// This object maintains a map of filenames to lists of buffered requests.
// When a file is loading from s3, any incoming requests for tiles will
// be buffered in this object. Once the file is done copying from s3, the
// requests are processed in bulk.
var bufferedRequests = {};

function ensureFileIsLocal(filename, cb) {
  var path = localPath(filename);

  if (fs.existsSync(path)) {
    // file is already local
    cb(null);
  } else {
    // file is on s3
    console.time("s3fetch");

    if (!bufferedRequests[filename]) {
      // this is the first request for this file; create an object that will
      // buffer subsequent requests.
      bufferedRequests[filename] = [];

      exec("aws s3 cp s3://WWSSN_Scans/" + filename + " --region us-east-1 " + path, function(err) {
        console.timeEnd("s3fetch");
        console.log("processing", bufferedRequests[filename].length, "buffered requests");

        // the file's been copied locally, now process all the buffered requests
        bufferedRequests[filename].forEach(function(requestCallback) {
          requestCallback(err);
        });

        // this entry is no longer needed; since the file is now local,
        // there will be no more buffering
        delete bufferedRequests[filename];
      });
    }

    // buffer this request for processing when the copy from s3 is done.
    bufferedRequests[filename].push(cb);
  }
}

router.get("/:filename/:z/:x/:y.png", function(req, res) {

  console.log("--- processing /tile ---", req.params);

  var filename = process.env.NODE_ENV === "production" ? req.params.filename : "dummy-seismo.png";

  ensureFileIsLocal(filename, function(err) {
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
