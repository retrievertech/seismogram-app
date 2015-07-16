import { Rectangle } from "./Rectangle.js";
import { Regions } from "./Regions.js";
var L = window.L;

export class Editor {
  constructor(SeismogramMap) {
    this.SeismogramMap = SeismogramMap;
    this.editing = false;
    this.rect = window.rect = new Rectangle();
  }

  startEditing() {
    var segmentsLayer = this.SeismogramMap.getLayer("segments");
    if (!segmentsLayer.on) {
      this.SeismogramMap.toggleLayer(segmentsLayer);
    }
    this.editing = true;
  }

  stopEditing() {
    this.editing = false;
  }

  //
  // Deletes all the map data that intersects `this.rect`
  //

  eraseData() {
    var segmentsLayer = this.SeismogramMap.getLayer("segments");
    var segments = segmentsLayer.leafletLayer.getLayers();
    var map = this.SeismogramMap.leafletMap;

    // rect bbox in pixels
    var sw = L.point(this.rect.w, this.rect.s),
        ne = L.point(this.rect.e, this.rect.n);

    // rect bbox in Lat Lng
    var bounds = L.latLngBounds(
      map.containerPointToLatLng(sw),
      map.containerPointToLatLng(ne)
    );

    segments.forEach((segment) => {
      var coords = segment.getLatLngs();

      var regions = new Regions();

      // This takes a list of points and breaks it into a list of regions,
      // where each region is a contiguous list of points that is either
      // inside the rectangle, or outside of it. (See Regions.js)
      coords.forEach((point) => {
        var type = bounds.contains(point) ? "in" : "out";
        regions.addPoint(point, type);
      });

      // Assuming the list of points is nonempty, so should the list of regions.
      console.assert(regions.regions.length > 0);

      if (regions.regions.length === 1) {
        // If there is only one region, and all the points in the region are
        // inside the rectangle, it means the whole segment is inside the rectangle,
        // so we just delete it.
        if (regions.regions[0].type === "in") {
          segmentsLayer.leafletLayer.removeLayer(segment);
        } else {
          // This would mean that all the points are outside the rect, meaning
          // the segment does not intersect the rect at all, so we leave it alone.
        }
      } else {
        // If there are multiple regions, it means there are points both inside and
        // outside the rectangle -- the segment crosses the rect but is not fully
        // contained, so we have to clip it at the edges of the rect and possibly
        // create multiple segments out of it (out of the parts that do not intersect
        // the rect.)

        // We first just delete the original.
        segmentsLayer.leafletLayer.removeLayer(segment);

        // We get all the regions that are outside the rectangle. Implicily, any
        // regions inside the rectangle will be omitted -- deleted.
        var outRegions = regions.regions.filter((region) => region.type === "out");

        // We create a brand-new segment for every region outside the rectangle.
        // TODO: the new segments need sensible IDs.
        // TODO: may need to transfer "properties". There may be grayscale values in
        // the properties, and we have to split that array accordingly.
        outRegions.forEach((region) => {
          L.polyline(region.points, segment.options).addTo(segmentsLayer.leafletLayer);
        });
      }
    });
  }
}
