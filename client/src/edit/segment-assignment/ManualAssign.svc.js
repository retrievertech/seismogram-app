export class ManualAssign {
  constructor(SeismogramMap) {
    this.SeismograMap = SeismogramMap;
  }

  start() {
    var meanlines = this.SeismogramMap.getLayer("meanlines");
    var segments = this.SeismogramMap.getLayer("segments");
    this.SeismogramMap.turnOffLayers();
    this.SeismogramMap.toggleLayer(meanlines);
    meanlines.leafletLayer.getLayers().forEach((meanline) => {
      this.installEventsOnMeanLine(meanline);
    });
  }

  installEventsOnMeanLine(meanline) {
    var meanlines = this.SeismogramMap.getLayer("meanlines");
    meanline.on("click", () => {
      meanlines.leafletLayer.getLayers().forEach((layer) => {
        layer.setStyle({
          opacity: layer === meanline ? 0.9 : 0.2
        });
      });
    });
  }
}
