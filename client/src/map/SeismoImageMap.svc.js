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
var imageMapCRS = L.extend({}, L.CRS.Simple, {
  projection: imageMapProjection,
  transformation: new L.Transformation(1, 0, 1, 0)
});

class SeismoImageMap {
  
  constructor($http, $q, SeismoServer) {
    this.server = SeismoServer;
    this.http = $http;
    this.q = $q;
    this.leafletMap = null;
    this.metadataLayers = [
      {
        name: "Region of Interest",
        key: "roi",
        on: true,
        zIndex: 10,
        leafletLayer: null,
        style: {
          color: "blue",
          weight: 1,
          opacity: 0.9
        }
      }, {
        name: "Mean Lines",
        key: "meanlines",
        on: true,
        zIndex: 11,
        leafletLayer: null,
        style: {
          color: "yellow",
          weight: 1,
          opacity: 0.9
        }
      }, {
        name: "Intersectons",
        key: "intersections",
        on: true,
        zIndex: 12,
        leafletLayer: null,
        style: {
          pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
              fillColor: "red",
              color: "white",
              weight: 1,
              opacity: 0.9,
              radius: feature.properties.radius
            });
          }
        }
      }, {
        name: "Segments",
        key: "segments",
        on: true,
        zIndex: 13,
        leafletLayer: null,
        style: {
          color: "red",
          weight: 1,
          opacity: 0.9
        }
      }
    ];

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
      maxZoom: 7,
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
    var s3Prefix = "https://s3.amazonaws.com/wwssn-metadata/010162_1742_0007_04/";
    var url = this.server.tilesUrl + "/" + imagename + "/{z}/{x}/{y}.png";

    // lazy initialization
    if (!this.imageLayer) {
      this.imageLayer = L.tileLayer(url, this.imageLayerOpts)
        .addTo(this.leafletMap);
    } else {
      this.imageLayer.setUrl(url);
    }

    // remove metadata layers from the map if any
    this.metadataLayers.forEach((layer) => {
      if (this.leafletMap.hasLayer(layer.leafletLayer)) {
        this.leafletMap.removeLayer(layer.leafletLayer);
      }
    });

    // load the data and recreate the layers
    var promises = this.metadataLayers.map((layer) => {
      return this.http({url: s3Prefix + layer.key + ".json"}).then((ret) => {
        console.log(layer.key + ":", ret.data);
        layer.leafletLayer = L.geoJson(ret.data, layer.style);
      });
    });

    // when all the data is loaded, put it on the map
    this.q.all(promises).then(() => {
      this.metadataLayers.forEach((layer) => {
        if (layer.on) {
          this.leafletMap.addLayer(layer.leafletLayer, {zIndex: layer.zIndex});
        }
      });
    });
  }

}

export { SeismoImageMap };
