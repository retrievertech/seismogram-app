var L = window.L;

export class StationMap {

  constructor(QueryData) {
    this.QueryData = QueryData;
    this.leafletMap = null;
    this.stationMarkers = [];
  }

  init(id) {
    this.leafletMap = new L.Map(id, {
      minZoom: 1,
      maxZoom: 5,
      maxBounds: [[-90, -180], [90, 180]]
    });
    L.control.scale().addTo(this.leafletMap);
    this.leafletMap.setView(new L.LatLng(0,0), 3);

    // Thank you stamen!
    let tileUrl = "https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg";
    let baseLayer = new L.TileLayer(tileUrl, {
      zIndex: 1,
      zoomAnimation: false,
      opacity: 0.4
    });
    this.leafletMap.addLayer(baseLayer);
    this.leafletMap.fire("baselayerchange", { layer: baseLayer });
  }

  updateBounds() {
    this.leafletMap.fitBounds(this.QueryData.resultsBBox());
  }

  renderQueryData() {
    // First, erase all existing markers
    this.stationMarkers.forEach((marker) => this.leafletMap.removeLayer(marker));
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

      marker.on("click", () => {
        this.stationCallback(station);
      });

      // Make sure you don't clobber double-click for zooming
      marker.on("dblclick", () => this.leafletMap.zoomIn());
      // Save the marker so we can get rid of it on the next search
      this.stationMarkers.push(marker);
      // Add it to the map
      marker.addTo(this.leafletMap);
    });
  }

  update() {
    // zoom the map to the extent of the result set
    this.updateBounds();
    // drop result pins on the map
    this.renderQueryData();
  }

  stationCallback(stationId) {
    // Do nothing by default. A controller can set this
    // callback with setStationCallback()
  }

  setStationCallback(cb) {
    this.stationCallback = cb;
  }
}
