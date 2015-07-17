import { SeismogramMapCRS } from "./SeismogramMapCRS.js";

var L = window.L;

//
// The service driving the Leaflet map that shows a tiled seismogram. Used in both
// the viewer and the editor.
//
export class SeismogramMap {

  constructor($timeout, $location, $http, $q, ServerUrls, FileStatus, ScreenMessage) {
    window.imageMap = this;

    this.$timeout = $timeout;
    this.$location = $location;
    this.$http = $http;
    this.$q = $q;
    this.ServerUrls = ServerUrls;
    this.FileStatus = FileStatus;
    this.ScreenMessage = ScreenMessage;

    this.leafletMap = null;
    this.currentFile = null;
    this.imageIsLoaded = false;

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
      crs: SeismogramMapCRS,
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
      path = this.FileStatus.is(file.status, "Has Edited Data") ?
        "edited-metadata" :
        "metadata";
    } else {
      // in production
      path = this.FileStatus.is(file.status, "Has Edited Data") ?
        "https://s3.amazonaws.com/wwssn-edited-metadata" :
        "https://s3.amazonaws.com/wwssn-metadata";
    }

    var s3Prefix = path + "/" + file.name + "/";

    var url = this.ServerUrls.tilesUrl + "/" + file.name + "/{z}/{x}/{y}.png";

    if (this.imageLayer) {
      this.leafletMap.removeLayer(this.imageLayer);
    }

    this.imageLayer = L.tileLayer(url, this.imageLayerOpts).addTo(this.leafletMap);

    this.ScreenMessage.start("Loading image...");

    this.imageLayer.on("load", () => {
      this.$timeout(() => {
        this.imageIsLoaded = true;
        this.ScreenMessage.stop("Loading image...");
      });
    });

    // remove metadata layers from the map if any
    this.metadataLayers.forEach((layer) => {
      if (this.leafletMap.hasLayer(layer.leafletLayer)) {
        this.leafletMap.removeLayer(layer.leafletLayer);
      }
    });

    if (!this.FileStatus.hasData(file.status)) {
      // nothing to load
      return;
    }

    this.ScreenMessage.start("Loading metadata...");

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

      this.ScreenMessage.stop("Loading metadata...");
    });
  }

}
