export class Editor {
  constructor($http, SeismogramMap, ServerUrls, ScreenMessage, ManualAssign, Popup) {
    this.$http = $http;
    this.SeismogramMap = SeismogramMap;
    this.ServerUrls = ServerUrls;
    this.ScreenMessage = ScreenMessage;
    this.ManualAssign = ManualAssign;
    this.Popup = Popup;

    this.editing = false;
  }

  startEditing() {
    this.editing = true;
  }

  stopEditing() {
    this.editing = false;
    this.ManualAssign.cancel(true);
  }

  manualAssign() {
    if (!this.SeismogramMap.assignment.hasData()) {
      this.ScreenMessage.ephemeral("There is nothing to edit.", "error", 2000);
      return;
    }
    this.ManualAssign.start();
  }

  autoAssign() {
    var segments = this.SeismogramMap.getLayer("segments");
    var meanlines = this.SeismogramMap.getLayer("meanlines");

    var request = {
      method: "POST",
      url: this.ServerUrls.assignUrl,
      data: {
        segments: JSON.stringify(segments.leafletLayer.toGeoJSON()),
        meanlines: JSON.stringify(meanlines.leafletLayer.toGeoJSON())
      }
    };

    this.ScreenMessage.start("Running Assignment. Please wait...");

    if (!segments.on) {
      this.SeismogramMap.toggleLayer(segments);
    }

    this.$http(request).then((res) => {
      this.ScreenMessage.stop("Running Assignment. Please wait...");
      this.ScreenMessage.ephemeral("Success.", "simple", 2000);
      // color the assignments
      this.SeismogramMap.setSegmentAssignment(res.data);
    }).catch((res) => {
      this.ScreenMessage.stop("Running Assignment. Please wait...");
      this.ScreenMessage.ephemeral("Error! Sorry!", "error", 3000);
      console.log("error", res);
    });
  }
}
