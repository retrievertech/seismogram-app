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

// Defines a flat (null transformation) coordinate space with (0,0) in the top-right.
var imageMapCRS = L.extend({}, L.CRS.Simple, {
  projection: imageMapProjection,
  transformation: new L.Transformation(1, 0, 1, 0)
});

class SeismoImageMap {
  
  constructor($http, SeismoServer) {
    this.server = SeismoServer;
    this.http = $http;
    this.leafletMap = null;
    this.imageLayer = null;
    this.imageLayerOpts = {
      // tileSize: 512,
      noWrap: true,
      crossOrigin: true,
      continuousWorld: true
    };
  }

  init(id) {
    var leafletMap = this.leafletMap = L.map(id, {
      maxZoom: 6,
      minZoom: 0,
      crs: imageMapCRS
    });

    // for debugging, for now
    leafletMap.on("click", function(e) {
      console.log("x:", e.latlng.lng, ", y:", e.latlng.lat);
    });
    
    leafletMap.setView(new L.LatLng(2000, 7000), 2);
  }

  loadImage(imagename) {
    var s3Prefix = "https://s3.amazonaws.com/wwssn-metadata/040471_0638_0023_04/";
    var url = this.server.tilesUrl + "/" + imagename + "/{z}/{x}/{y}.png";

    // lazy initialization
    if (!this.imageLayer) {
      this.imageLayer = L.tileLayer(url, this.imageLayerOpts)
        .addTo(this.leafletMap);
      // quick overlay of meanlines geojson
      this.http({url: s3Prefix + "meanlines.json"}).then((ret) => {
        console.log(ret.data);
        L.geoJson(ret.data, {
          color: "red",
          weight: 2,
          opacity: 0.9
        }).addTo(this.leafletMap);
      });
      return;
    }
    this.imageLayer.setUrl(url);
  }

}

export { SeismoImageMap };
