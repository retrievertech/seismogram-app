import { Rectangle } from "./Rectangle.js";
var L = window.L;

export class Editor {
  constructor(SeismogramMap) {
    this.SeismogramMap = SeismogramMap;
    this.editing = false;
    this.rect = window.rect = new Rectangle();
  }

  startEditing() {
    this.editing = true;
  }

  stopEditing() {
    this.editing = false;
  }

  eraseData() {
    var segmentsLayer = this.SeismogramMap.getLayer("segments");
    var json = segmentsLayer.leafletLayer.toGeoJSON();
    var segments = json.features;
    var map = this.SeismogramMap.leafletMap;

    var sw = L.point(this.rect.w, this.rect.s),
        ne = L.point(this.rect.e, this.rect.n);

    var bounds = L.latLngBounds(
      map.containerPointToLatLng(sw),
      map.containerPointToLatLng(ne)
    );

    segments.forEach((segment) => {
      var coords = segment.geometry.coordinates;

      var poo = [];

      coords.forEach((point) => {
        if (bounds.contains([point[1], point[0]])) {
          //console.log("found point", point);
        } else {
          poo.push(point);
        }
      });

      segment.geometry.coordinates = poo;
    });

    segmentsLayer.leafletLayer.clearLayers();
    segmentsLayer.leafletLayer.addData(json);

    console.log("end");
  }
}
