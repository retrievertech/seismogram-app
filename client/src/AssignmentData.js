//
// Encapsulates the "segment assignment" JSON returned by the server. Provides some
// functionality for keeping the assigment data in sync with what's displayed.
//
export class AssignmentData {
  constructor() {
    // The assignment data as computed by the assignment algorithm. Its form is
    //   { meanlineId : [segmentId, ...], ... }
    // mapping a meanline ID to a list of segment IDs.
    this.assignment = null;
    // The reverse mapping of the data above. Its form is
    //   { segmentId : meanlineId, ... }
    this.reverseAssignment = null;
  }

  hasData() {
    return typeof this.assignment === "object" &&
      Object.keys(this.assignment).length > 0;
  }

  getData() {
    return this.assignment;
  }

  setData(assignment) {
    this.assignment = assignment;
    this.setReverseAssignment();
  }

  meanlineIdForSegmentId(segmentId) {
    return this.reverseAssignment[parseInt(segmentId)];
  }

  // Sets the mapping from segment IDs to their meanline ID. This is precomputed so we
  // can quickly find a segment's mean when we iterate all the segments, below.
  // This is because the assignment data is in the form
  //   meanlineId -> [list of segment IDs]
  // This data structure is inefficient for getting the meanlineId corresponding to
  // a segmentId (the reverse mapping).
  setReverseAssignment() {
    this.reverseAssignment = {};

    Object.keys(this.assignment).forEach((meanlineId) => {
      this.assignment[meanlineId].forEach((segmentId) => {
        this.reverseAssignment[parseInt(segmentId)] = parseInt(meanlineId);
      });
    });
  }

  // updates the segment layer colors based on the meanlines' colors.
  // "meanlines" and "segments" are the metadata layers defined in SeismogramMap.
  updateColors(meanlines, segments) {
    // Helper function that gets a copy of the style for a mean line.
    var getStyle = (meanlineId) => {
      if (typeof meanlineId === "undefined")
        return;

      var ml = meanlines.leafletLayer.getLayers();

      for (var i = 0; i < ml.length; ++i) {
        if (ml[i].feature.id === meanlineId) {
          // create a fresh mean lines style
          var style = meanlines.style.style();
          // set its color to this mean line's color
          style.color = ml[i].options.color;
          return style;
        }
      }
    };

    // Iterate each segment on the map and color it with its corresponding
    // mean line's style
    segments.leafletLayer.getLayers().forEach((layer) => {
      // Get its meanline ID
      var meanLineId = this.meanlineIdForSegmentId(layer.feature.id);
      // Get a copy of the style for the meanline ID
      var style = getStyle(meanLineId);
      // Apply the style to the segment.
      if (style) {
        layer.setStyle(style);
      }
    });
  }
}
