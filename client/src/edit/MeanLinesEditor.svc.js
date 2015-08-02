class MeanLinesEditor {
  constructor(SeismogramMap, Popup) {
    this.SeismogramMap = SeismogramMap;
    this.Popup = Popup;
    this.editing = false;

    // Currently clicked mean line
    this._clickedMeanLine = null;
    // And its color
    this._clickedMeanLineColor = null;
  }

  // Start editing mean lines:

  startEditing() {
    if (this.editing) return;

    var meanlines = this.SeismogramMap.getLayer("meanlines");

    // Force the layer to be visible.
    if (!meanlines.on) {
      this.SeismogramMap.toggleLayer(meanlines);
    }

    meanlines.leafletLayer.getLayers().forEach((meanLine) => {
      // We install the editing events on each mean line
      this.installEventsOnMeanLine(meanLine);
      // Turn on Leaflet.Editable on the mean line
      meanLine.enableEdit();
    });

    this.editing = true;
  }

  // Stop editing mean lines.

  stopEditing() {
    if (!this.editing) return;

    var meanlines = this.SeismogramMap.getLayer("meanlines");

    meanlines.leafletLayer.getLayers().forEach((meanLine) => {
      // Delete the previously installed editing events
      this.deleteEventsFromMeanLine(meanLine);
      // Disable Leaflet.Editable for the mean line
      meanLine.disableEdit();
    });

    this.editing = false;
  }

  deleteEventsFromMeanLine(meanLine) {
    meanLine.off("editable:vertex:dragstart");
    meanLine.off("editable:vertex:drag");
    meanLine.off("click");
  }

  // The following function installs editing events on each mean line given:
  // For forcing the x-coordinates to stay constant, and for selecting mean
  // lines for deletion by clicking them.

  installEventsOnMeanLine(meanLine) {
    var meanlines = this.SeismogramMap.getLayer("meanlines");

    // Get rid of previously-installed events

    this.deleteEventsFromMeanLine(meanLine);

    // The following two event installs force the x-coordinate of the currently
    // dragged mean line knob to remain constant.

    // This is a cheap way to ensure that the mean lines align with the beginning
    // and end x-coordinates of the original image, under the assumption that
    // meanlines are generated in this way by the server.

    // currentX saves the original x-coordinate of the currently dragged knob
    var currentX = 0;

    // When starting to drag, save the knob's x-coordinate
    meanLine.on("editable:vertex:dragstart", (evt) => {
      currentX = evt.vertex.getLatLng().lng;
    });

    // When dragging, force the x-coordinate to stay the same
    meanLine.on("editable:vertex:drag", (evt) => {
      var latLng = evt.vertex.getLatLng();
      var newLatLng = window.L.latLng(latLng.lat, currentX);
      evt.vertex.setLatLng(newLatLng);
    });

    // The following event will select a mean line for deletion.
    meanLine.on("click", () => {
      // If we already clicked a mean line before, reset that mean line's style
      // to its original color.
      if (this._clickedMeanLine) {
        var style = meanlines.style.style();
        style.color = this._clickedMeanLineColor;
        this._clickedMeanLine.setStyle(style);
      }

      // This is the current clicked mean line
      this._clickedMeanLine = meanLine;
      this._clickedMeanLineColor = meanLine.options.color;

      // When a mean line is clicked, we change its style. We make it red
      // and fatter.
      this._clickedMeanLine.setStyle({
        color: "red",
        weight: 5
      });

      // We then open a popup.
      this.Popup.open("Delete the selected mean line?", () => {
        // If the user clicks yes, we remove the mean line from the data
        meanlines.leafletLayer.removeLayer(this._clickedMeanLine);

        // Update the segment assignment to remove this mean line, and recolor
        // the unassigned segments to their original color
        if (this.SeismogramMap.assignment.hasData()) {
          this.SeismogramMap.assignment.deletedMeanLine(
            this._clickedMeanLine.feature.id,
            this.SeismogramMap.getLayer("segments")
          );
        }

        this._clickedMeanLine = null;
      }, () => {
        // If the user clicks no, we revert the mean line to the original styling
        var style = meanlines.style.style();
        style.color = this._clickedMeanLineColor;
        this._clickedMeanLine.setStyle(style);
        this._clickedMeanLine = null;
      });
    });
  }

  getNewId() {
    var meanlines = this.SeismogramMap.getLayer("meanlines");
    var id = -1;

    meanlines.leafletLayer.getLayers().forEach((layer) => {
      if (layer.feature.id >= id) {
        id = layer.feature.id + 1;
      }
    });

    return id;
  }

  // Add a new meanline:

  addMeanLine() {
    // First we stop editing, which disables the Leaflet.Editable editor on
    // all mean lines. This is crucial because otherwise, the editor will not
    // be automatically enabled on the newly added line.
    this.stopEditing();

    var meanlines = this.SeismogramMap.getLayer("meanlines");

    // We grab the seismogram's maximal x-coordinate by grabbing the first
    // mean line and getting the x-coord of its second point.
    var firstLine = meanlines.leafletLayer.getLayers()[0].toGeoJSON();
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
    meanlines.leafletLayer.addData(newLine);

    // Restart the editing
    this.startEditing();
  }
}

export { MeanLinesEditor };
