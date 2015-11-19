var _ = window._;
var JSZip = window.JSZip;

export class DataHandler {

  constructor($http, $timeout, ScreenMessage, ServerUrls, SeismogramMap) {
    this.$http = $http;
    this.$timeout = $timeout;
    this.ScreenMessage = ScreenMessage;
    this.ServerUrls = ServerUrls;
    this.SeismogramMap = SeismogramMap;

    this.saving = false;
  }

  saveChanges() {
    this.saving = true;

    var layers = this.SeismogramMap.getAllData();

    var request = {
      method: "POST",
      url: this.ServerUrls.saveUrl + "/" + this.SeismogramMap.currentFile.name,
      data: { layers: layers }
    };

    this.ScreenMessage.start("Saving...");

    this.$timeout(() => {
      this.$http(request).then(() => {
        this.saving = false;
        this.ScreenMessage.stop("Saving...");
        this.ScreenMessage.ephemeral("Metadata Saved", "simple", 3000);
      }).catch(() => {
        this.saving = false;
        this.ScreenMessage.stop("Saving...");
        this.ScreenMessage.ephemeral("Saving attempt failed...", "error", 5000);
      });
    }, 100);
  }

  discardChanges() {
    this.ScreenMessage.start("Reverting to saved data...");

    this.$timeout(() => {
      this.SeismogramMap.metadataLayers.forEach((layer) => this.SeismogramMap.resetLayer(layer));
      this.$timeout(() => {
        this.ScreenMessage.stop("Reverting to saved data...");
        this.ScreenMessage.ephemeral("Changes discarded.", "simple", 3000);
      });
    }, 100);
  }

  downloadFiles() {
    var layers = this.SeismogramMap.getAllData();
    var filename = this.SeismogramMap.currentFile.name + ".zip";
    var zip = new JSZip();
    layers.forEach((layer) => zip.file(layer.key + ".json", layer.contents));
    var data = zip.generate({ type: "blob" });
    window.saveAs(data, filename);
  }

  downloadCenterlinesAsCSV() {

    var getPointsAssignedToMeanline = (segmentIds, meanlineId) => {
      console.log("meanlineId:", meanlineId, "numSegmentIds:", segmentIds.length);

      // map segment ids -> segment coordinates
      var segmentCoords = segmentIds.map((id) => {
        if (!segments[id]) {
          // console.log("ERROR: missing segment", id, "assigned to meanline", meanlineId);
          return [];
        }
        return segments[id][0].geometry.coordinates;
      });

      // flatten to a single list of points
      var segmentPoints = _.flatten(segmentCoords, true);

      // remove points with overlapping x values
      var segmentPoints = _.uniq(segmentPoints, (point) => point[0]);

      // sort points by x value
      // TODO: This is kind of sketchy because it doesn't guarantee
      // that points within a segment remain in sequence. I tried
      // sorting segments before flattening and eliminating overlapping
      // domains, but that leads to point x-values that are occasionally
      // out of order. We need to think more about overlapping domains.
      var segmentPoints = _.sortBy(segmentPoints, (coord) => coord[0]);

      return segmentPoints;
    }

    var createCSVFromPointsDict = () => {
      var csv = "";

      // add csv header row
      var meanlineIds = Object.keys(assignments);
      for (var i = 0; i < meanlineIds.length; i++) {
        csv += "x"+meanlineIds[i]+",y"+meanlineIds[i];
        if (i === meanlineIds.length - 1) {
          csv += "\n";
        } else {
          csv += ",";
        }
      }

      // add to csv one cell at at time,
      // iterate over rows first, then columns
      for (var row = 0; row < maxRows; row++) {
        for (var col = 0; col < meanlineIds.length; col++) {
          var meanlineId = meanlineIds[col];
          var curXValues = pointsDict[meanlineId][0],
              curYValues = pointsDict[meanlineId][1];
          
          if (curXValues.length > row) {
            csv += curXValues[row] + "," + curYValues[row];
          } else {
            // no data for this meanline on this row
            csv += ",";
          }

          if (col === meanlineIds.length - 1) {
            csv += "\n";
          } else {
            csv += ",";
          }
        }
      }

      return csv;
    }

    var assignments = this.SeismogramMap.assignment.getData();
    var segments = this.SeismogramMap.getLayer("segments").leafletLayer.toGeoJSON();
    segments = _.groupBy(segments.features, "id");

    var pointsDict = _.mapObject(assignments, getPointsAssignedToMeanline);
    var pointCounts = _.map(pointsDict, function(points) { return points.length; });
    var maxRows = _.max(pointCounts);

    // transform pointsDict from containing arrays of points to containing
    // separate arrays of x and y values
    var pointsDict = _.mapObject(pointsDict, function(points) {
      if (points.length === 0) {
        return [[], []];
      }
      return _.unzip(points);
    });

    var csv = createCSVFromPointsDict(assignments, pointsDict);

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var filename = this.SeismogramMap.currentFile.name + ".csv";
    window.saveAs(blob, filename);
  }
}
