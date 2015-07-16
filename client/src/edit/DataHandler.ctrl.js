export class DataHandler {

  constructor($http, ScreenMessage, ServerUrls, SeismogramMap) {
    this.$http = $http;
    this.ScreenMessage = ScreenMessage;
    this.ServerUrls = ServerUrls;
    this.SeismogramMap = SeismogramMap;

    this.saving = false;
  }

  saveChanges() {
    this.saving = true;

    var layers = this.SeismogramMap.metadataLayers.map((layer) => {
      return {
        name: layer.name,
        key: layer.key,
        contents: JSON.stringify(layer.leafletLayer.toGeoJSON())
      };
    });

    var request = {
      method: "POST",
      url: this.ServerUrls.saveUrl + "/" + this.SeismogramMap.currentFile.name,
      data: { layers: layers }
    };

    this.$http(request).then(() => {
      this.saving = false;
      this.ScreenMessage.ephemeral("Metadata Saved", "simple", 3000);
    }).catch(() => {
      this.saving = false;
      this.ScreenMessage.ephemeral("Saving attempt failed...", "error", 5000);
    });
  }

  discardChanges() {
    this.SeismogramMap.metadataLayers
      .filter((layer) => layer.key !== "segments")
      .forEach((layer) => this.SeismogramMap.resetLayer(layer));
  }

}
