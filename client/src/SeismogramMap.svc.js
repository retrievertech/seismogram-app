import { SeismogramMapCRS } from "./SeismogramMapCRS.js";
import { AssignmentData } from "./AssignmentData.js";

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

    // segment assignment data
    this.assignment = new AssignmentData();

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
          style: () => {
            var nextColor;
            if (this.colors.length > 0) {
              nextColor = this.colors.pop();
            } else {
              var randomChannel = () => Math.floor(Math.random() * 256);
              nextColor = "rgb(" + [0,0,0].map(randomChannel).join(",") + ")";
            }
            return {
              color: nextColor,
              weight: 3,
              opacity: 0.9
            };
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
          weight: 3,
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

  turnOffLayers() {
    this.metadataLayers.forEach((layer) => {
      if (layer.on) {
        this.toggleLayer(layer);
      }
    });
  }

  resetLayer(layer) {
    layer.leafletLayer.clearLayers();
    layer.leafletLayer.addData(JSON.parse(layer.originalData));
  }

  loadImage(file) {
    this.currentFile = file;
    this.imageIsLoaded = false;

    this.colors = this.createColorList();

    var path;

    if (this.$location.host() === "localhost") {
      // we are in development
      path = this.FileStatus.is(file.status, "Edited") ?
        "https://s3.amazonaws.com/wwssn-edited-metadata" :
        "https://s3.amazonaws.com/wwssn-metadata";
    } else {
      // in production
      path = this.FileStatus.is(file.status, "Edited") ?
        // nginx gzip proxy to s3
        "/s3/wwssn-edited-metadata" :
        "/s3/wwssn-metadata";
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

    // We grab the segment assignment if it's there. It may not be.
    var assignmentPromise = () => this.$http({
      url: s3Prefix + "assignment.json?token=" + Math.random()
    }).then((res) => this.setSegmentAssignment(res.data));

    // when all the data is loaded, put it on the map
    this.$q.all(promises).finally(() => {
      this.metadataLayers.forEach((layer) => {
        if (layer.on && layer.leafletLayer) {
          this.leafletMap.addLayer(layer.leafletLayer);
        }
      });
    }).then(assignmentPromise).catch(() => {}).then(() => {
      this.ScreenMessage.stop("Loading metadata...");
    });
  }

  setSegmentAssignment(assignment) {
    var meanlines = this.getLayer("meanlines");
    var segments = this.getLayer("segments");
    this.assignment.setData(assignment);
    this.assignment.updateColors(meanlines, segments);
  }

  getAllData() {
    var layers = this.metadataLayers.map((layer) => {
      return {
        name: layer.name,
        key: layer.key,
        contents: JSON.stringify(layer.leafletLayer.toGeoJSON())
      };
    });

    // The assignment may not exist if the user never ran the automatic segment
    // assignment.
    if (this.assignment.hasData()) {
      layers.push({
        name: "Segment Assignment",
        key: "assignment",
        contents: JSON.stringify(this.assignment.getData())
      });
    }

    return layers;
  }

  createColorList() {
    // from https://eleanormaclure.files.wordpress.com/2011/03/colour-coding.pdf
    // and http://stackoverflow.com/a/4382138/1457005
    return [
      "rgb(255, 179, 0)",
      "rgb(128, 62, 117)",
      "rgb(255, 104, 0)",
      "rgb(166, 189, 215)",
      "rgb(193, 0, 32)",
      "rgb(206, 162, 98)",
      "rgb(129, 112, 102)",
      "rgb(0, 125, 52)",
      "rgb(246, 118, 142)",
      "rgb(0, 83, 138)",
      "rgb(255, 122, 92)",
      "rgb(83, 55, 122)",
      "rgb(255, 142, 0)",
      "rgb(179, 40, 81)",
      "rgb(244, 200, 0)",
      "rgb(127, 24, 13)",
      "rgb(147, 170, 0)",
      "rgb(89, 51, 21)",
      // "rgb(241, 58, 19)", // too similar to "red"
      "rgb(35, 44, 22)"
    ];
  }
}
