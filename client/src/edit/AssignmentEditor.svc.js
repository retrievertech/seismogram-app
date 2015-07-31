export class AssignmentEditor {
  constructor($http, SeismogramMap, ServerUrls, ScreenMessage, Popup) {
    this.$http = $http;
    this.SeismogramMap = SeismogramMap;
    this.ServerUrls = ServerUrls;
    this.ScreenMessage = ScreenMessage;
    this.Popup = Popup;
    this.editing = false;
  }

  startEditing() {
    this.editing = true;
  }

  stopEditing() {
    this.editing = false;
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

    this.$http(request).then((res) => {
      this.ScreenMessage.stop("Running Assignment. Please wait...");
      this.ScreenMessage.ephemeral("Success.", "simple", 2000);
      this.colorAssignments(res.data);
    }).catch((res) => {
      this.ScreenMessage.stop("Running Assignment. Please wait...");
      this.ScreenMessage.ephemeral("Error! Sorry!", "error", 3000);
      console.log("error", res);
    });
  }

  colorAssignments(assignments) {
    var meanlines = this.SeismogramMap.getLayer("meanlines");
    var segments = this.SeismogramMap.getLayer("segments");

    var getStyle = (meanlineId) => {
      var ml = meanlines.leafletLayer.getLayers();
      for (var i = 0; i < ml.length; ++i) {
        if (ml[i].feature.id === meanlineId) {
          var style = meanlines.style.style();
          style.color = ml[i].options.color;
          return style;
        }
      }
      console.log("didnt find mean line", meanlineId);
    };

    var mapping = {};
    var s = new Set();

    Object.keys(assignments).forEach((k) => {
      assignments[k].forEach((segmentId) => {
        segmentId = parseInt(segmentId);
        s.add(segmentId);
        var meanlineId = parseInt(k);
        mapping[segmentId] = meanlineId;
      });
    });

    window.mapping = mapping;

    console.log("set size", s.size);
    console.log("here", Object.keys(mapping).length);
    console.log("total", segments.leafletLayer.getLayers().length);
    console.log(Object.keys(assignments));
    console.log(meanlines.leafletLayer.getLayers().map((layer) => layer.feature.id));

    segments.leafletLayer.getLayers().forEach((layer) => {
      var meanLineId = mapping[layer.feature.id];
      var style = getStyle(meanLineId);
      if (!style) {
        console.log("fail", layer.feature.id);
      }
      layer.setStyle(style);
    });
    console.log("done");
  }
}
