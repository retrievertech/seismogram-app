class ImageMapLoader {
  constructor($timeout, $http, $q, Loading, SeismoImageMap, SeismoServer, SeismoData) {
    this.$timeout = $timeout;
    this.$http = $http;
    this.$q = $q;
    this.Loading = Loading;
    this.SeismoImageMap = SeismoImageMap;
    this.SeismoServer = SeismoServer;
    this.SeismoData = SeismoData;
  }
  load(filename) {
    if (this.SeismoData.gotDataAlready) {
      // If SeismoData is already populated, we assume we came here through a link
      // e.g. from the browser, so the file data will already be in SeismoData,
      // and so will the list of stations.
      var files = this.SeismoData.filesQueryData.files;
      var fileObject = files.find((file) => file.name === filename);
      this.$timeout(() => this.SeismoImageMap.loadImage(fileObject));
    } else {
      // Otherwise we assume we came to this route directly, so we have to load
      // the file data and the stations.
      this.$q.all({
        // The stations data is currently needed for showing the station
        // name in the "details" window.
        stations: this.$http({ url: this.SeismoServer.stationsUrl }),
        file: this.$http({ url: this.SeismoServer.fileUrl + "/" + filename })
      }).then((res) => {
        this.SeismoData.setStationQueryData(res.stations.data);
        this.SeismoImageMap.loadImage(res.file.data);
      }).catch(() => {
        this.Loading.start("Seismogram not found.");
      });
    }
  }
}

export { ImageMapLoader };
