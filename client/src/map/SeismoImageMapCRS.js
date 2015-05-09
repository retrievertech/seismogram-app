var L = window.L;

// This has to agree with the same value in server/tiler.js
var imageCoordExtent = Math.pow(2, 15);
// Assume 256px tiles
var scale = 256 / imageCoordExtent;

// Translation between tile coords and image coords
var imageMapProjection = {
  project: function (latlng) {
    return new L.Point(latlng.lng * scale, latlng.lat * scale);
  },

  unproject: function (point) {
    return new L.LatLng(point.y / scale, point.x / scale);
  },

  // Defines a coordinate space with (0,0) in the top-left
  bounds: L.bounds([0, imageCoordExtent], [0, imageCoordExtent])
};

// Defines a flat (null transformation) coordinate space with (0,0) in the top-left.
var SeismoImageMapCRS = L.extend({}, L.CRS.Simple, {
  projection: imageMapProjection,
  transformation: new L.Transformation(1, 0, 1, 0)
});

export { SeismoImageMapCRS };
