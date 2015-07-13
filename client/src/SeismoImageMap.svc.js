import { SeismoImageMapCRS } from "./SeismoImageMapCRS.js";

var L = window.L;

class SeismoImageMap {

  constructor($timeout, $location, $http, $q, SeismoServer, SeismoStatus, Loading) {
    window.imageMap = this;

    this.$timeout = $timeout;
    this.$location = $location;
    this.$http = $http;
    this.$q = $q;
    this.SeismoServer = SeismoServer;
    this.SeismoStatus = SeismoStatus;
    this.Loading = Loading;

    this.leafletMap = null;
    this.currentFile = null;
    this.imageIsLoaded = false;

    this.metadataLayers = [
      {
        name: "Mean Lines",
        key: "meanlines",
        on: false,
        zIndex: 11,
        leafletLayer: null,
        style: {
          color: "yellow",
          weight: 3,
          opacity: 0.9
        }
      }, {
        name: "Segments",
        key: "segments",
        on: true,
        zIndex: 13,
        leafletLayer: null,
        style: {
          style: () => {
            var randomChannel = () => Math.floor(Math.random() * 256);
            var randomColor = () => "rgb(" + [0,0,0].map(randomChannel).join(",") + ")";
            return {
              color: randomColor(),
              weight: 3,
              opacity: 0.9
            };
          }
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
      minZoom: 0,
      crs: SeismoImageMapCRS,
      editable: true,
      editOptions: {
        skipMiddleMarkers: true
      }
    });

    leafletMap.setView(new L.LatLng(3000, 8000), 3);
  }

  getLayer(key) {
    return this.metadataLayers.find((layer) => layer.key === key);
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
    this.imageIsLoaded = false;

    var path;

    if (this.$location.host() === "localhost") {
      // we are in development
      path = this.SeismoStatus.is(file.status, "Edited") ?
        "edited-metadata" :
        "metadata";
    } else {
      // in production
      path = this.SeismoStatus.is(file.status, "Edited") ?
        "https://s3.amazonaws.com/wwssn-edited-metadata" :
        "https://s3.amazonaws.com/wwssn-metadata";
    }

    var s3Prefix = path + "/" + file.name + "/";

    var url = this.SeismoServer.tilesUrl + "/" + file.name + "/{z}/{x}/{y}.png";

    if (this.imageLayer) {
      this.leafletMap.removeLayer(this.imageLayer);
    }

    this.imageLayer = L.tileLayer(url, this.imageLayerOpts).addTo(this.leafletMap);

    this.Loading.start("Loading image...");

    this.imageLayer.on("load", () => {
      this.$timeout(() => {
        this.imageIsLoaded = true;
        this.Loading.stop("Loading image...");
      });
    });

    // remove metadata layers from the map if any
    this.metadataLayers.forEach((layer) => {
      if (this.leafletMap.hasLayer(layer.leafletLayer)) {
        this.leafletMap.removeLayer(layer.leafletLayer);
      }
    });

    if (!this.SeismoStatus.is(file.status, "Complete") && !this.SeismoStatus.is(file.status, "Edited")) {
      // nothing to load
      return;
    }

    this.Loading.start("Loading metadata...");

    // load the data and recreate the layers
    var promises = this.metadataLayers.map((layer) => {
      var token = Math.random();
      return this.$http({url: s3Prefix + layer.key + ".json?token=" + token}).then((ret) => {
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
