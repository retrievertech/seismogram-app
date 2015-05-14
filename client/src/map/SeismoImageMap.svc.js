import { SeismoImageMapCRS } from "./SeismoImageMapCRS.js";
var L = window.L;

var IntersectionCircle = L.CircleMarker.extend({
  getRadius: function(zoom, feature) {
    if (zoom > 5) {
      return feature.properties.radius / Math.pow(2, 7 - zoom);
    } else {
      return 3;
    }
  },
  updateRadius: function(zoom, feature) {
    feature = feature || this.feature;
    this.setRadius(this.getRadius(zoom, feature));
  }
});

class SeismoImageMap {

  constructor($timeout, $location, $http, $q, SeismoServer, Loading) {
    var map = window.imageMap = this;

    this.SeismoServer = SeismoServer;
    this.Loading = Loading;
    this.$http = $http;
    this.$location = $location;
    this.$q = $q;
    this.$timeout = $timeout;
    this.leafletMap = null;
    this.currentFile = null;
    this.metadataLayers = [
      {
        name: "Region of Interest",
        key: "roi",
        on: false,
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
        on: false,
        zIndex: 11,
        leafletLayer: null,
        style: {
          color: "yellow",
          weight: 1,
          opacity: 0.9
        }
      }, {
        name: "Intersections",
        key: "intersections",
        on: false,
        zIndex: 12,
        leafletLayer: null,
        style: {
          pointToLayer: function(feature, latlng) {
            var marker = new IntersectionCircle(latlng, {
              fillColor: "yellow",
              color: "red",
              weight: 1,
              opacity: 1,
              fillOpacity: 0.9
            });
            marker.updateRadius(map.leafletMap.getZoom(), feature);
            return marker;
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
      crs: SeismoImageMapCRS,
      editable: true,
      editOptions: {
        skipMiddleMarkers: true
      }
    });

    // Zoom-sensitive sizing of circle radii.
    leafletMap.on("zoomend", () => {
      var intersections = this.metadataLayers.find((layer) => layer.key === "intersections");

      if (!intersections.leafletLayer) return;

      var circles = intersections.leafletLayer.getLayers();
      var zoom = leafletMap.getZoom();
      circles.forEach((circle) => circle.updateRadius(zoom));
    });

    leafletMap.setView(new L.LatLng(2000, 7000), 2);
  }

  toggleLayer(layer) {
    if (layer.on) {
      this.leafletMap.removeLayer(layer.leafletLayer);
    } else {
      this.leafletMap.addLayer(layer.leafletLayer);
    }

    layer.on = !layer.on;

    this.metadataLayers
      .filter((layer) => layer.on)
      .sort((l1, l2) => l1.zIndex - l2.zIndex)
      .forEach((layer) => layer.leafletLayer.bringToFront());
  }

  resetLayer(layer) {
    layer.leafletLayer.clearLayers();
    layer.leafletLayer.addData(JSON.parse(layer.originalData));
  }

  loadImage(file) {
    this.currentFile = file;

    var s3Prefix;
    if (this.$location.host() === "localhost") {
      // we are in development
      s3Prefix = "metadata/" + file.name + "/";
    } else {
      // in production
      s3Prefix = "https://s3.amazonaws.com/wwssn-metadata/" + file.name + "/";
    }

    var url = this.SeismoServer.tilesUrl + "/" + file.name + "/{z}/{x}/{y}.png";

    // lazy initialization
    if (!this.imageLayer) {
      this.imageLayer = L.tileLayer(url, this.imageLayerOpts)
        .addTo(this.leafletMap);
    } else {
      this.imageLayer.setUrl(url);
    }

    this.Loading.start("Loading image...");

    this.imageLayer.on("load", () => {
      this.$timeout(() => this.Loading.stop("Loading image..."));
    });

    // remove metadata layers from the map if any
    this.metadataLayers.forEach((layer) => {
      if (this.leafletMap.hasLayer(layer.leafletLayer)) {
        this.leafletMap.removeLayer(layer.leafletLayer);
      }
    });

    if (file.status !== 3) {
      // nothing to load
      return;
    }

    this.Loading.start("Loading metadata...");

    // load the data and recreate the layers
    var promises = this.metadataLayers.map((layer) => {
      return this.$http({url: s3Prefix + layer.key + ".json"}).then((ret) => {
        console.log(layer.key + ":", ret.data);
        layer.leafletLayer = L.geoJson(ret.data, layer.style);
        layer.leafletLayer.on("dblclick", () => this.leafletMap.zoomIn());
        layer.originalData = JSON.stringify(ret.data);
      });
    });

    // when all the data is loaded, put it on the map
    this.$q.all(promises).then(() => {
      this.metadataLayers.forEach((layer) => {
        if (layer.on) {
          this.leafletMap.addLayer(layer.leafletLayer);
        }
      });

      this.Loading.stop("Loading metadata...");
    });
  }

}

export { SeismoImageMap };
