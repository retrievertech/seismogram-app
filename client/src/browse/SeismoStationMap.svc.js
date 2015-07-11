import {Leaflet} from "bower_components/redfish-util/lib/Leaflet.js";
import {Evented} from "bower_components/redfish-util/lib/Evented.js";

var L = window.L;

class SeismoStationMap extends Evented {

  constructor(SeismoData) {
    super();
    this.SeismoData = SeismoData;

    this.map = null;
    this.leafletMap = null;
    this.isReady = false;
    this.stationMarkers = [];
  }

  init(id) {
    console.log("init", id);

    var map = window.stationmap = this.map = new Leaflet(id, null, {
      minZoom: 2,
      maxBounds: [[-90, -180], [90, 180]]
    });
    this.leafletMap = map.leafletMap;
    map.leafletMap.setView(new L.LatLng(0,0), 3);
    map.addLayers();
    map.setBaseLayer(map.baseLayers[3]);

    // see https://www.mapbox.com/developers/api/maps/ for other tile styles
    // e.g. try replacing mapbox.outdoors with mapbox.light to test a different style

    map.setBaseLayer({
      name: "Seismogram",
      leafletLayer: new L.TileLayer("http://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmVubmxpY2giLCJhIjoieUxHOHQyNCJ9.VLDDBTTdzeHKJvR5ABYaLA", {
        minZoom: 2,
        maxZoom: 18,
        zIndex: 1,
        zoomAnimation: false,
        opacity: 0.4
      })
    });


    console.log(map.currentBaseLayer);

    map.currentBaseLayer.leafletLayer.once("loading", () => {
      this.isReady = true;
      this.fire("ready");
    });
  }

  updateBounds() {
    this.leafletMap.fitBounds(this.SeismoData.resultsBBox());
  }

  whenReady(callback) {
    if (typeof callback !== "function") return;

    if (this.isReady) {
      callback();
    } else {
      this.on("ready", callback);
    }
  }

  renderQueryData() {
    this.stationMarkers.forEach((marker) => this.map.leafletMap.removeLayer(marker));
    this.stationMarkers = [];

    window._.keys(this.SeismoData.stationStatuses).forEach((stationId) => {
      var stationStatus = this.SeismoData.stationStatuses[stationId];
      var total = stationStatus.status.reduce((x,y) => x+y, 0);
      var station = this.SeismoData.getStation(stationId);

      var marker = new L.Marker(new L.LatLng(station.lat, station.lon), {
        icon: L.divIcon({
          className: "station-marker",
          iconSize: null,
          html: "<div class=marker>" + total + "</div><div class=station-location>" + station.location + "</div>"
        })
      });

      marker.on("dblclick", () => this.map.leafletMap.zoomIn());
      this.stationMarkers.push(marker);
      marker.addTo(this.map.leafletMap);
    });
  }
}

export { SeismoStationMap };
