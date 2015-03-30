// based on http://bost.ocks.org/mike/leaflet/

var d3 = window.d3;
var L = window.L;

class LeafletD3Overlay {
  constructor(leafletMap) {
    this.map = leafletMap;
    this.svg = d3.select(leafletMap.getPanes().overlayPane).append("svg");
    this.root = this.svg.append("g");

    leafletMap.on("viewreset", () => { this.reset(); });
    this.reset();
  }

  createGroup() {
    return this.root.append("g");
  }

  project(x, y) {
    var point = this.map.latLngToLayerPoint(new L.LatLng(y, x));
    return point;
  }

  reset() {
    // Assume that an svg that covers the
    // entire world will fit any dataset.
    var topLeft = this.project( -180, 90 ),
        bottomRight = this.project( 180, -90 );

    // Pad the svg to account for icons
    // that extend beyond map boundaries.
    var padding = 50;

    this.svg
      .attr("width", bottomRight.x - topLeft.x + 2*padding)
      .attr("height", bottomRight.y - topLeft.y + 2*padding)
      .style("margin-left", topLeft.x - padding + "px")
      .style("margin-top", topLeft.y - padding + "px");

    this.root
      .attr("transform", "translate(" + -(topLeft.x - padding) + "," + -(topLeft.y - padding) + ")");
  }
}

export { LeafletD3Overlay };
