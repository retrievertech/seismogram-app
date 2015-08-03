var _ = window._;

class MeanLinesEditor {
  constructor(SeismogramMap, Popup) {
    this.SeismogramMap = SeismogramMap;
    this.Popup = Popup;

    this.editing = false;

    // list of mean lines selected for deletion
    this._selectedMeanlines = [];
    this._meanlines = this.SeismogramMap.getLayer("meanlines");
    this._segments = this.SeismogramMap.getLayer("segments");
  }

  // Start editing mean lines:

  startEditing() {
    if (this.editing) return;

    // Force the layer to be visible.
    if (!this._meanlines.on) {
      this.SeismogramMap.toggleLayer(this._meanlines);
    }

    this._meanlines.leafletLayer.getLayers().forEach((meanline) => {
      // We install the editing events on each mean line
      this.installEventsOnMeanline(meanline);
      // Turn on Leaflet.Editable on the mean line
      meanline.enableEdit();
    });

    this.editing = true;
  }

  // Stop editing mean lines.

  stopEditing() {
    if (!this.editing) return;

    this._meanlines.leafletLayer.getLayers().forEach((meanline) => {
      // Delete the previously installed editing events
      this.deleteEventsFromMeanline(meanline);
      // Disable Leaflet.Editable for the mean line
      meanline.disableEdit();
    });

    this.editing = false;
  }

  deleteEventsFromMeanline(meanline) {
    meanline.off("editable:vertex:dragstart");
    meanline.off("editable:vertex:drag");
    meanline.off("click");
  }

  // The following function installs editing events on each mean line given:
  // For forcing the x-coordinates to stay constant, and for selecting mean
  // lines for deletion by clicking them.

  installEventsOnMeanline(meanline) {
    // Get rid of previously-installed events

    this.deleteEventsFromMeanline(meanline);

    // The following two event installs force the x-coordinate of the currently
    // dragged mean line knob to remain constant.

    // This is a cheap way to ensure that the mean lines align with the beginning
    // and end x-coordinates of the original image, under the assumption that
    // meanlines are generated in this way by the server.

    // currentX saves the original x-coordinate of the currently dragged knob
    var currentX = 0;

    // When starting to drag, save the knob's x-coordinate
    meanline.on("editable:vertex:dragstart", (evt) => {
      currentX = evt.vertex.getLatLng().lng;
    });

    // When dragging, force the x-coordinate to stay the same
    meanline.on("editable:vertex:drag", (evt) => {
      var latLng = evt.vertex.getLatLng();
      var newLatLng = window.L.latLng(latLng.lat, currentX);
      evt.vertex.setLatLng(newLatLng);
    });

    // The following event will select a mean line for deletion.
    meanline.on("click", () => {
      var alreadySelectedMeanline = _.find(this._selectedMeanlines, (meanlineInfo) => {
        return meanlineInfo.meanline === meanline;
      });

      if (alreadySelectedMeanline) {
        // If we already clicked a mean line before, reset that mean line's style
        // to its original color and delete it from the list.
        this._selectedMeanlines = _.without(this._selectedMeanlines, alreadySelectedMeanline);
        alreadySelectedMeanline.meanline.setStyle({
          color: alreadySelectedMeanline.color,
          weight: alreadySelectedMeanline.weight
        });
      } else {
        // If we haven't selected this mean line, add it to the list and save its
        // original style, too.
        this._selectedMeanlines.push({
          meanline: meanline,
          color: meanline.options.color,
          weight: meanline.options.weight
        });
        // When a mean line is selected, we change its style. We make it red
        // and fatter.
        meanline.setStyle({
          color: "red",
          weight: 5
        });
      }
      // Open/close the popup as needed.
      this.checkPopupState();
    });
  }

  // Opens or closes the popup depends on if any mean lines are selected for deleting.
  checkPopupState() {
    // If there are no mean lines selected, close.
    if (this._selectedMeanlines.length === 0) {
      this.Popup.close();
      return;
    }

    // If there are mean lines selected, open the popup.
    this.Popup.open("Delete the selected mean lines?", () => {
      // If the user clicks "OK" we delete the selected mean lines.

      // First we save the IDs of the mean lines to be deleted.
      var meanlineIds = this._selectedMeanlines.map((meanlineInfo) =>
        meanlineInfo.meanline.feature.id);

      // We delete the mean lines from the map.
      this._selectedMeanlines.forEach((meanlineInfo) =>
        this._meanlines.leafletLayer.removeLayer(meanlineInfo.meanline));

      // Update the segment assignment to remove the mean line, and recolor
      // the unassigned segments to their original color
      if (this.SeismogramMap.assignment.hasData()) {
        meanlineIds.forEach((meanlineId) =>
          this.SeismogramMap.assignment.deletedMeanline(meanlineId, this._segments));
      }

      this._selectedMeanlines = [];
    }, () => {
      // If the user clicks no, we revert the mean lines to the original styling
      this._selectedMeanlines.forEach((meanlineInfo) =>
        meanlineInfo.meanline.setStyle({
          color: meanlineInfo.color,
          weight: meanlineInfo.weight
        }));

      this._selectedMeanlines = [];
    });
  }

  // Returns a new mean line ID -- basically the highest existing ID + 1.
  getNewId() {
    var id = -1;

    this._meanlines.leafletLayer.getLayers().forEach((layer) => {
      if (layer.feature.id >= id) {
        id = layer.feature.id + 1;
      }
    });

    return id;
  }

  // Add a new meanline:
  addMeanline() {
    // First we stop editing, which disables the Leaflet.Editable editor on
    // all mean lines. This is crucial because otherwise, the editor will not
    // be automatically enabled on the newly added line.
    this.stopEditing();

    // We grab the seismogram's maximal x-coordinate by grabbing the first
    // mean line and getting the x-coord of its second point.
    var firstLine = this._meanlines.leafletLayer.getLayers()[0].toGeoJSON();
    var secondPoint = firstLine.geometry.coordinates[1];

    // The new mean line
    var newLine = {
      type: "Feature",
      id: this.getNewId(),
      geometry: {
        type: "LineString",
        coordinates: [
          // We anchor it as [0,0], and its second point shares the x-coord
          // with the other mean lines, and its y-coord is 0. Basically it
          // gets added to the very top of the seismogram, and its length
          // is the length of the seismogram.
          [0,0], [secondPoint[0], 0]
        ]
      }
    };

    // Add the mean line to the mean lines layer.
    this._meanlines.leafletLayer.addData(newLine);

    // Add the new mean line to the assignment.
    if (this.SeismogramMap.assignment.hasData()) {
      this.SeismogramMap.assignment.addedMeanline(newLine.id);
    }

    // Restart the editing
    this.startEditing();
  }
}

export { MeanLinesEditor };
