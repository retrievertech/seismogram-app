import {Leaflet} from "../../bower_components/redfish-core/lib/Leaflet.js";

var L = window.L;

class SeismoMap {
  
  constructor() {
    this.map = null;
    this.leafletMap = null;
    this.pies = [];
  }

  init(id) {
    var map = this.map = new Leaflet(id, null, {minZoom: 1});
    this.leafletMap = map.leafletMap;
    map.leafletMap.setView(new L.LatLng(0,0), 3);
    map.addLayers();
    map.setBaseLayer(map.baseLayers[3]);
  }
  
  render(data) {
        
  }

}

export { SeismoMap }