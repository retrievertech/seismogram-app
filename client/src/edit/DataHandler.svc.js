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
    var zip = new window.JSZip();
    layers.forEach((layer) => zip.file(layer.key + ".json", layer.contents));
    var data = zip.generate({ type: "blob" });
    window.saveAs(data, filename);
  }
}
