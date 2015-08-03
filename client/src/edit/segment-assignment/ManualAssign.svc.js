//
// Handles the interaction that assigns segments to mean lines.
//
export class ManualAssign {
  constructor(SeismogramMap, ScreenMessage, Popup) {
    this.SeismogramMap = SeismogramMap;
    this.Popup = Popup;
    this.ScreenMessage = ScreenMessage;

    // Tracks the selected mean line
    this.selectedMeanline = null;
    // Tracks the segments that will be assigned to the selected mean line
    // The objects in this array will be stored as:
    //  { segment: segment, color: color }
    // The color is the original color of the segment, in case the user unselects
    // the segment.
    this.selectedSegments = [];

    this.meanlines = SeismogramMap.getLayer("meanlines");
    this.segments = SeismogramMap.getLayer("segments");
  }

  start() {
    this.selectMeanLine();
  }

  // Step 1: Select a mean line.
  selectMeanLine() {
    // Make sure only the mean line layer is on.
    this.SeismogramMap.turnOffLayers();
    this.SeismogramMap.toggleLayer(this.meanlines);

    // Install click events on mean lines.
    this.meanlines.leafletLayer.getLayers().forEach((meanline) =>
      this.installEventsOnMeanLine(meanline));

    // Open a popup. When the user clicks OK, we move on to selecting segments.
    this.Popup.open(
      "Select a mean line and click OK when done.",
      () => this.selectSegments(),
      () => this.cancel()
    );
  }

  // Step 2: Select segments to assign to a mean line.
  selectSegments() {
    // If no mean line selected in step 1, issue a warning and repeat step 1.
    if (!this.selectedMeanline) {
      this.ScreenMessage.ephemeral("Please select a mean line or click Cancel.", "error", 2000);
      this.cancel();
      this.selectMeanLine();
      return;
    }

    // Forget events on mean lines -- so mean lines are not clickable while we select
    // segments.
    this.meanlines.leafletLayer.getLayers().forEach((meanline) =>
      this.uninstallEventsOnMeanline(meanline));

    // Make sure the segment layer is on.
    if (!this.segments.on) {
      this.SeismogramMap.toggleLayer(this.segments);
    }

    // Install the click event on segments.
    this.segments.leafletLayer.getLayers().forEach((segment) =>
      this.installEventsOnSegment(segment));

    // Issue a popup. When the user clicks "OK", only then the actual data is updated.
    // Until then, selected segments are stored in `this.selectedSegments`
    this.Popup.open(
      "Click segments to assign them to the selected mean line. Click them again " +
      "to unassign them. Click OK when done.",
      () => this.postProcess(),
      () => this.cancel(true)
    );
  }

  // Finalize the edit.
  postProcess() {
    // Update the segment assignment data
    this.SeismogramMap.assignment.reassignSegments(
      this.selectedMeanline.feature.id,
      this.selectedSegments.map((s) => s.segment.feature.id)
    );
    // Go back to normal.
    this.cancel();
  }

  // This cancels everything. Uninstall all the events, restore meanlines to original
  // opacity.
  cancel(restoreSegments=false) {
    // Forget the selected mean line.
    this.selectedMeanline = null;
    if (restoreSegments) {
      // Restore segments to original colors.
      this.selectedSegments.forEach((segmentInfo) =>
        segmentInfo.segment.setStyle({ color: segmentInfo.color }));
    }
    // Forget selected segments.
    this.selectedSegments = [];
    // Uninstall events on meanlines.
    this.meanlines.leafletLayer.getLayers().forEach((meanline) =>
      this.uninstallEventsOnMeanline(meanline));
    // Uninstall events on segments.
    this.segments.leafletLayer.getLayers().forEach((segment) =>
      this.uninstallEventsOnSegment(segment));
    // Restore mean lines to original opacity.
    this.restoreMeanlinesOpacity();
    this.Popup.close();
  }

  // Install click event on segments: when a segment is clicked, it is stored for
  // assignment to the selected mean line.
  installEventsOnSegment(segment) {
    segment.on("click", () => {
      // See if this segment was already clicked before.
      var alreadyPickedSegment = window._.find(this.selectedSegments, (segmentInfo) =>
        segmentInfo.segment === segment);

      if (alreadyPickedSegment) {
        // Segment was already selected, so we unselect it.
        this.selectedSegments = window._.without(this.selectedSegments, alreadyPickedSegment);
        // We restore it to its original color.
        segment.setStyle({ color: alreadyPickedSegment.color });
      } else {
        // Segment was not already picked.

        // We put it on our list of picked segments.
        this.selectedSegments.push({
          segment: segment,
          // We save its original color,
          color: segment.options.color
        });
        // because we change its color to that of the selected mean line.
        var meanlineColor = this.selectedMeanline.options.color;
        segment.setStyle({ color: meanlineColor });
      }
    });
  }

  // Uninstall click events. TODO: This is too barbaric, we should just Uninstall
  // our particular click callback.
  uninstallEventsOnSegment(segment) {
    segment.off("click");
  }

  // Bring mean lines back to original opacity. TODO: This 0.9 value is hardcoded.
  // The canonical value is in the style definition of mean lines in SeismogramMap.
  // metadataLayers
  restoreMeanlinesOpacity() {
    this.meanlines.leafletLayer.getLayers().forEach((layer) => {
      layer.setStyle({ opacity: 0.9 });
    });
  }

  // When a mean line is clicked, we make all other mean lines very faint --
  // opacity 0.2. TODO: many other possibilities here.
  installEventsOnMeanLine(meanline) {
    meanline.on("click", () => {
      this.selectedMeanline = meanline;
      this.meanlines.leafletLayer.getLayers().forEach((layer) => {
        layer.setStyle({
          opacity: layer === meanline ? 0.9 : 0.2
        });
      });
    });
  }

  // Uninstall click events. TODO: This is too barbaric, we should just Uninstall
  // our particular click callback.
  uninstallEventsOnMeanline(meanline) {
    meanline.off("click");
  }
}
