import {Leaflet} from "../../bower_components/redfish-core/lib/Leaflet.js";

var L = window.L;

class SeismoStationMap {

  constructor(SeismoData, PieOverlay) {
    this.SeismoData = SeismoData;
    this.PieOverlay = PieOverlay;

    this.map = null;
    this.leafletMap = null;
    this.pies = [];
  }

  init(id) {
    var map = this.map = new Leaflet(id, null, {
      minZoom: 2,
      maxBounds: [[-90, -180], [90, 180]]
    });
    this.leafletMap = map.leafletMap;
    map.leafletMap.setView(new L.LatLng(0,0), 3);
    map.addLayers();
    // map.setBaseLayer(map.baseLayers[3]);

    // see https://www.mapbox.com/developers/api/maps/ for other tile styles
    // e.g. try replacing mapbox.outdoors with mapbox.light to test a different style
    map.setBaseLayer({
      name: "Seismogram",
      leafletLayer: new L.TileLayer("http://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmVubmxpY2giLCJhIjoieUxHOHQyNCJ9.VLDDBTTdzeHKJvR5ABYaLA", {
        minZoom: 2,
        maxZoom: 18,
        zIndex: 1,
        zoomAnimation: false
      })
    });

    this.PieOverlay.init(this.leafletMap);
  }

  updateBounds() {
    this.leafletMap.fitBounds(this.SeismoData.resultsBBox());
  }
}

export { SeismoStationMap };
