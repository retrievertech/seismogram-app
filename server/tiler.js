const { createCanvas } = require('canvas');

var imageCoordExtent = Math.pow(2, 15);

function Tiler(tileSize) {
  this.tileSize = tileSize || 256;
  this.cache = {};
}

Tiler.prototype.tileRect = function(tx, ty, zoom) {
  // Returns a rectangle [x, y, width, height] with dimensions
  // representing which coordinates in the source image are covered
  // by the tile at the specified zoom and tile coordinates (tx, ty).

  var tileCoordExtent = this.tileSize * Math.pow(2, zoom),
      scale = imageCoordExtent / tileCoordExtent; // number of image pixels in one tile pixel at this zoom

  var x = tx * this.tileSize * scale,
      y = ty * this.tileSize * scale,
      size = this.tileSize * scale;

  return [x, y, size, size];
};

Tiler.prototype.createTile = function(image, z, x, y) {
  var canvas = createCanvas(this.tileSize, this.tileSize),
      ctx = canvas.getContext("2d");

  var [sourceX, sourceY, sourceWidth, sourceHeight] = this.tileRect(x, y, z);

  var destWidth = canvas.width;
  var destHeight = canvas.height;

  // BEGIN node-canvas bugfix. See https://github.com/Automattic/node-canvas/issues/1249#issuecomment-449468751.
  // Can delete everything between BEGIN/END comments once resolved--this code compensates for the bug
  // by being careful not to sample pixels from outside of the bounds of the source image.
  var scale = sourceWidth / destWidth;

  if (sourceX > image.width || sourceY > image.height)
    return canvas;

  var overageX = sourceX + sourceWidth - image.width;
  var overageY = sourceY + sourceHeight - image.height;

  if (overageX > 0) {
    destWidth -= overageX / scale;
    sourceWidth -= overageX;
  }

  if (overageY > 0) {
    destHeight -= overageY / scale;
    sourceHeight -= overageY;
  }
  // END node-canvas bugfix

  ctx.patternQuality = "fast";
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, destWidth, destHeight);

  return canvas;
};

module.exports = Tiler;
