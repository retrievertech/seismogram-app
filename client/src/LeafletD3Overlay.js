// based on http://bl.ocks.org/monfera/11100987

// If we ever update Leaflet to bleeding edge,
// see https://github.com/Leaflet/Leaflet/issues/3315

var d3 = window.d3;
var L = window.L;

class LeafletD3Overlay {
  constructor(leafletMap) {
    this.map = leafletMap;

    // init the leaflet svg element
    this.map._initPathRoot();
    // grab it; it handles zoom animation for you
    this.svg = d3.select(leafletMap.getContainer()).select("svg");
    
    this.root = this.svg.append("g");
  }

  createGroup() {
    return this.root.append("g");
  }

  project(x, y) {
    var point = this.map.latLngToLayerPoint(new L.LatLng(y, x));
    return point;
  }
}

export { LeafletD3Overlay };
