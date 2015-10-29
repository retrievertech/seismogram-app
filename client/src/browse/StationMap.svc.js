import {Leaflet} from "bower_components/redfish-util/lib/Leaflet.js";

var L = window.L;

export class StationMap {

  constructor(QueryData) {
    this.QueryData = QueryData;
    this.map = null;
    this.leafletMap = null;
    this.stationMarkers = [];
  }

  init(id) {
    var map = window.stationmap = this.map = new Leaflet(id, null, {
      minZoom: 1,
      maxZoom: 4,
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
        zIndex: 1,
        zoomAnimation: false,
        opacity: 0.4
      })
    });
  }

  updateBounds() {
    this.leafletMap.fitBounds(this.QueryData.resultsBBox());
  }

  renderQueryData() {
    // First, erase all existing markers
    this.stationMarkers.forEach((marker) => this.map.leafletMap.removeLayer(marker));
    this.stationMarkers = [];

    window._.keys(this.QueryData.filesQueryData.stations).forEach((stationId) => {
      var total = this.QueryData.filesQueryData.stations[stationId];
      var station = this.QueryData.getStation(stationId);

      // Make marker. Note: This HTML is styled in styles.less
      var marker = new L.Marker(new L.LatLng(station.lat, station.lon), {
        icon: L.divIcon({
          className: "station-marker",
          iconSize: null,
          html: "<div class=marker>" + total + "</div><div class=station-location>" + station.location + "</div>"
        })
      });

      // Make sure you don't clobber double-click for zooming
      marker.on("dblclick", () => this.map.leafletMap.zoomIn());
      // Save the marker so we can get rid of it on the next search
      this.stationMarkers.push(marker);
      // Add it to the map
      marker.addTo(this.map.leafletMap);
    });
  }

  update() {
    // zoom the map to the extent of the result set
    this.updateBounds();
    // drop result pins on the map
    this.renderQueryData();
  }
}
