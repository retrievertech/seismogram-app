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

  getHighestNewId() {
    var segmentsLayer = this.SeismogramMap.getLayer("segments");
    var id = -1;

    segmentsLayer.leafletLayer.getLayers().forEach((layer) => {
      if (!layer.feature) {
        console.log(layer);
      }
      if (layer.feature.id >= id) {
        id = layer.feature.id + 1;
      }
    });

    return id;
  }

  eraseData() {
    var newId = this.getHighestNewId();

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
      // the coords of each point in the segment
      var coords = segment.getLatLngs();

      var regions = new Regions();

      // This takes a list of points and breaks it into a list of regions,
      // where each region is a contiguous list of points that is either
      // inside the rectangle, or outside of it. (See Regions.js)

      for (var i = 0; i < coords.length; ++i) {
        // the i-th point
        var point = coords[i];
        var type = bounds.contains(point) ? "in" : "out";
        regions.addPoint({ point: point }, type);
      }

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

        // We get all the regions that are outside the rectangle. Implicitly, any
        // regions inside the rectangle will be omitted -- deleted.
        var outRegions = regions.regions.filter((region) => region.type === "out");

        // Compute JSON features for the new segments we will add to the map
        var newFeatures = outRegions.map((region) => {
          return {
            type: "Feature",
            id: newId++,
            geometry: {
              type: "LineString",
              coordinates: region.points.map((pointData) => [pointData.point.lng, pointData.point.lat])
            }
          };
        });

        // We create a brand-new segment for every region outside the rectangle.
        newFeatures.forEach((newSegmentFeature) => {
          // Create a new style borrowing the parent segment's color
          var style = window._.extend(segmentsLayer.style, {
            color: segment.options.color
          });

          // We first create a Leaflet geoJson layer from this. We want this because
          // L.geoJson creates a "feature" member for the layer containing its geoJson.
          // This way we can access geoJson ID, properties, etc., from the leaflet
          // layer.
          var newSegmentLayer = L.geoJson(newSegmentFeature, style);

          // However, L.geoJson creates a new layer, and nests the feature layer inside
          // it. We don't want this. We want all segments to be stored in a flat
          // structure instead of an awkward tree structure of layers of layers of segments.
          // So we immediately grab the first layer from the L.geoJson structure,
          // which corresponds to our segment.
          var newSegment = newSegmentLayer.getLayers()[0];

          // And add it to the segments layer.
          newSegment.addTo(segmentsLayer.leafletLayer);
        });

        var oldSegmentId = segment.feature.id;
        var newIds = newFeatures.map((feature) => feature.id);

        var assignment = this.SeismogramMap.assignment;
        if (assignment.hasData()) {
          assignment.replaceRemovedSegmentId(oldSegmentId, newIds);
        }
      }
    });
  }
}
