import { Rectangle } from "./Rectangle.js";
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

    //
    // For new we delete all the points interesecting the box.
    //

    segments.forEach((segment) => {
      var coords = segment.getLatLngs();

      // We make a new points array
      var newPoints = [];

      // This array excludes all the points that are inside the box
      coords.forEach((point) => {
        if (bounds.contains(point)) {
        } else {
          newPoints.push(point);
        }
      });

      if (newPoints.length === 0) {
        // If there are no more points in this segment, we just axe it.
        segmentsLayer.leafletLayer.removeLayer(segment);
      } else {
        // Otherwise we populate the segment with the remaining points.
        segment.setLatLngs(newPoints);
      }
    });
  }
}
