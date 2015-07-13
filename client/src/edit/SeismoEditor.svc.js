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
    layer.leafletLayer.getLayers().forEach((object) => object.enableEdit());
  }

  stopEditing() {
    var layer = this.layerBeingEdited;

    if (layer !== null) {
      layer.leafletLayer.getLayers().forEach((object) => object.disableEdit());
    }

    this.layerBeingEdited = null;
  }

}

export { SeismoEditor };
