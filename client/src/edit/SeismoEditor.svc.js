class SeismoEditor {

  constructor($http, Loading, SeismoServer, SeismoImageMap) {
    this.$http = $http;
    this.Loading = Loading;
    this.SeismoServer = SeismoServer;
    this.SeismoImageMap = SeismoImageMap;

    this.saving = false;
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
    this.SeismoImageMap.metadataLayers
      .filter((layer) => layer.key !== "segments")
      .forEach((layer) => this.SeismoImageMap.resetLayer(layer));
  }

}

export { SeismoEditor };
