// based on http://bost.ocks.org/mike/leaflet/

var d3 = window.d3;

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
    var topLeft = this.project( -180, 90 ),
        bottomRight = this.project( 180, -90 );

    this.svg
      .attr("width", bottomRight.x - topLeft.x)
      .attr("height", bottomRight.y - topLeft.y)
      .style("margin-left", topLeft.x + "px")
      .style("margin-top", topLeft.y + "px");

    this.root
      .attr("transform", "translate(" + -topLeft.x + "," + -topLeft.y + ")");
  }
}

export { LeafletD3Overlay }