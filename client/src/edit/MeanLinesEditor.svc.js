class MeanLinesEditor {
  constructor(SeismoEditor, SeismoImageMap, Popup) {
    this.SeismoEditor = SeismoEditor;
    this.SeismoImageMap = SeismoImageMap;
    this.Popup = Popup;
    this.editing = false;
  }

  stopEditing() {
    var meanlines = this.SeismoImageMap.getLayer("meanlines");
    meanlines.leafletLayer.getLayers().forEach((meanLine) =>
      this.deleteEventsFromMeanLine(meanLine));
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
    var meanlines = this.SeismoImageMap.getLayer("meanlines");

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
      // When a mean line is clicked, we change its style. We make it red
      // and fatter.
      meanLine.setStyle({
        color: "red",
        weight: 5
      });

      // We then open a popup.
      this.Popup.open("Delete the selected mean line?", () => {
        // If the user clicks yes, we remove the mean line from the data
        meanlines.leafletLayer.removeLayer(meanLine);
      }, () => {
        // If the user clicks no, we revert the mean line to the original styling
        // TODO: will need work when mean lines are different colors.
        meanLine.setStyle(meanlines.style);
      });
    });
  }

  // Start editing mean lines:

  startEditing() {
    if (this.editing) return;

    var meanlines = this.SeismoImageMap.getLayer("meanlines");
    // We install the editing events on each mean line
    meanlines.leafletLayer.getLayers().forEach((meanLine) => this.installEventsOnMeanLine(meanLine));
    // We enable the Leaflet.Editable editor
    this.SeismoEditor.startEditingLayer(meanlines);
    this.editing = true;
  }

  // Add a new meanline:

  addMeanLine() {
    // First we stop editing, which disables the Leaflet.Editable editor on
    // all mean lines. This is crucial because otherwise, the editor will not
    // be automatically enabled on the newly added line.
    this.SeismoEditor.stopEditing();

    var meanlines = this.SeismoImageMap.getLayer("meanlines");

    // We grab the seismogram's maximal x-coordinate by grabbing the first
    // mean line and getting the x-coord of its second point.
    var firstLine = meanlines.leafletLayer.getLayers()[0].toGeoJSON();
    var secondPoint = firstLine.geometry.coordinates[1];

    // The new mean line
    var newLine = {
      type: "Feature",
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

    // We invoke startEditing() as opposed to SeismoEditor.startEditingLayer()
    // because startEditing() makes sure to install all the editing events on all
    // meanlines, which includes the newly created mean line.
    this.startEditing();
  }
}

export { MeanLinesEditor };
