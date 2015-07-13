var shiftPressed = false;

class SeismoEditor {

  constructor($http, Loading, SeismoServer, SeismoImageMap) {
    this.$http = $http;
    this.Loading = Loading;
    this.SeismoServer = SeismoServer;
    this.SeismoImageMap = SeismoImageMap;

    this.layerBeingEdited = null;

    this.editing = false;
    this.saving = false;

    // catch shift presses, used for editing intersection radii
    document.onkeydown = (e) => {
      if (e.keyCode === 16) shiftPressed = true;
    };

    document.onkeyup = () => {
      shiftPressed = false;
    };
  }

  startEditing() {
    this.editing = true;
  }

  exitEditing() {
    this.editing = false;
    this.stopEditing();
  }

  saveChanges() {
    this.saving = true;

    var layers = this.SeismoImageMap.metadataLayers.map((layer) => {
      return {
        name: layer.name,
        key: layer.key,
        contents: JSON.stringify(layer.leafletLayer.toGeoJSON())
      };
    });

    var request = {
      method: "POST",
      url: this.SeismoServer.saveUrl + "/" + this.SeismoImageMap.currentFile.name,
      data: { layers: layers }
    };

    this.$http(request).then(() => {
      this.saving = false;
      this.Loading.ephemeral("Metadata Saved", "simple", 3000);
    }).catch(() => {
      this.saving = false;
      this.Loading.ephemeral("Saving attempt failed...", "error", 5000);
    });
  }

  discardChanges() {
    this.stopEditing();

    this.SeismoImageMap.metadataLayers
      .filter((layer) => layer.key !== "segments")
      .forEach((layer) => this.SeismoImageMap.resetLayer(layer));
  }

  startEditingLayer(layer) {
    this.stopEditing();

    // if the layer is off, turn it on
    if (!layer.on) {
      this.SeismoImageMap.toggleLayer(layer);
    }

    // not yet for these
    if (layer.key === "segments") {
      return;
    }

    this.layerBeingEdited = layer;

    var map = this.SeismoImageMap.leafletMap;

    if (layer.key === "intersections") {
      // we have to do a bunch of custom stuff here to get intersection editing to work.

      layer.leafletLayer.getLayers().forEach((circle) => {
        // prevMousePosition holds the previous x-coord of the mouse cursor
        // so we can determine if the mouse is moved to the left or to the right.
        var prevMousePosition = 0;

        // we register mousedown events for moving and radius-sizing
        circle.on("mousedown", (e) => {
          var zoom = map.getZoom();
          prevMousePosition = e.latlng.lng;

          // once the mouse has been pressed, we catch mousemove events on the map
          map.on("mousemove", (e) => {
            // if shift is pressed while the mouse is down and being moved, we resize
            // the circle's radius, but only at zooms for which the actual radius is rendered
            // (see IntersectionCircle.getRadius())
            
            if (shiftPressed && zoom > 5) {
              var distance = Math.abs(e.latlng.lng - prevMousePosition);
              var radius = circle.feature.properties.radius;
              var newRadius = radius + distance;

              // if the mouse is moved to the right, we increase the radius.
              // if it's moved to the left, we decrease it.
              if (e.latlng.lng < prevMousePosition) {
                newRadius = radius - distance;

                // we never make the radius less than 3px
                if (radius - distance < 3) {
                  newRadius = 3;
                }
              }

              // modify the underlying geoJson, too.
              circle.feature.properties.radius = newRadius;
              circle.updateRadius(zoom);

              prevMousePosition = e.latlng.lng;
            } else {
              // if shift is not pressed, we move the marker.
              circle.setLatLng(e.latlng);
            }
          });
        });

        // on mouse up, we disable the mousemove event we just installed
        map.on("mouseup", () => map.removeEventListener("mousemove"));
      });
    } else {
      layer.leafletLayer.getLayers().forEach((object) => object.enableEdit());
    }
  }

  stopEditing() {
    var layer = this.layerBeingEdited;

    if (layer !== null) {
      if (layer.key === "intersections") {
        // for intersections, remove the circle mousedown events
        layer.leafletLayer.getLayers().forEach((circle) => circle.off("mousedown"));
      } else {
        layer.leafletLayer.getLayers().forEach((object) => object.disableEdit());
      }
    }

    this.layerBeingEdited = null;
  }

}

export { SeismoEditor };
