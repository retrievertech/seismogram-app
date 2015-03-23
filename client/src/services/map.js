import {Leaflet} from "../bower_components/redfish-core/lib/Leaflet.js";

var L = window.L;

window.angular.module("seismoApp")
.service("map", [function() {
  return {
    map: null,
    leafletMap: null,
    init: function(id) {
      var map = this.map = new Leaflet(id, null, {minZoom: 1});
      this.leafletMap = map.leafletMap;
      map.leafletMap.setView(new L.LatLng(0,0), 3);
      map.addLayers();
      map.setBaseLayer(map.baseLayers[3]);
    }
  };
}]);