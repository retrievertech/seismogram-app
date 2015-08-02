export class ManualAssign {
  constructor(SeismogramMap, ScreenMessage, Popup) {
    this.SeismogramMap = SeismogramMap;
    this.Popup = Popup;
    this.ScreenMessage = ScreenMessage;

    this.selectedMeanline = null;
    this.selectedSegments = [];
    this.meanlines = SeismogramMap.getLayer("meanlines");
    this.segments = SeismogramMap.getLayer("segments");
  }

  start() {
    this.selectMeanLine();
  }

  selectMeanLine() {
    this.SeismogramMap.turnOffLayers();
    this.SeismogramMap.toggleLayer(this.meanlines);

    this.meanlines.leafletLayer.getLayers().forEach((meanline) =>
      this.installEventsOnMeanLine(meanline));

    this.Popup.open(
      "Select a mean line and click OK when done.",
      () => this.selectSegments(),
      () => this.cancel()
    );
  }

  selectSegments() {
    if (!this.selectedMeanline) {
      this.ScreenMessage.ephemeral("Please select a mean line or click Cancel.", "error", 2000);
      this.cancel();
      this.selectMeanLine();
      return;
    }

    this.meanlines.leafletLayer.getLayers().forEach((meanline) =>
      this.uninstallEventsOnMeanline(meanline));

    if (!this.segments.on) {
      this.SeismogramMap.toggleLayer(this.segments);
    }

    this.segments.leafletLayer.getLayers().forEach((segment) =>
      this.installEventsOnSegment(segment));

    this.Popup.open(
      "Click segments to assign them to the selected mean line. Click them again " +
      "to unassign them. Click OK when done.",
      () => this.postProcess(),
      () => this.cancel()
    );
  }

  postProcess() {
    this.restoreMeanlinesOpacity();

    this.SeismogramMap.assignment.reassignSegments(
      this.selectedMeanline.feature.id,
      this.selectedSegments.map((s) => s.segment.feature.id)
    );

    this.cancel();
  }

  cancel() {
    this.selectedMeanline = null;
    this.selectedSegments = [];

    this.meanlines.leafletLayer.getLayers().forEach((meanline) =>
      this.uninstallEventsOnMeanline(meanline));

    this.segments.leafletLayer.getLayers().forEach((segment) =>
      this.uninstallEventsOnSegment(segment));

    this.restoreMeanlinesOpacity();
  }

  installEventsOnSegment(segment) {
    segment.on("click", () => {
      var alreadyPickedSegment = window._.find(this.selectedSegments, (segmentInfo) =>
        segmentInfo.segment === segment);

      if (alreadyPickedSegment) {
        // Segment was already selected
        this.selectedSegments = window._.without(this.selectedSegments, alreadyPickedSegment);
        segment.setStyle({ color: alreadyPickedSegment.color });
      } else {
        var meanlineColor = this.selectedMeanline.options.color;
        this.selectedSegments.push({
          segment: segment,
          color: segment.options.color
        });
        segment.setStyle({ color: meanlineColor });
      }
    });
  }

  uninstallEventsOnSegment(segment) {
    segment.off("click");
  }

  restoreMeanlinesOpacity() {
    this.meanlines.leafletLayer.getLayers().forEach((layer) => {
      layer.setStyle({ opacity: 0.9 });
    });
  }

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

  uninstallEventsOnMeanline(meanline) {
    meanline.off("click");
  }
}
