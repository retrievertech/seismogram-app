//
// This service loads a file into the image map. It grabs the file data from the server
// unless the file data is already present in QueryData.filesQueryData.
// It is used by the viewer and editor to initially load the image.
//
class ImageMapLoader {
  constructor($timeout, $http, $q, Loading, SeismoImageMap, ServerUrls, QueryData) {
    this.$timeout = $timeout;
    this.$http = $http;
    this.$q = $q;
    this.Loading = Loading;
    this.SeismoImageMap = SeismoImageMap;
    this.ServerUrls = ServerUrls;
    this.QueryData = QueryData;
  }
  load(filename) {
    if (this.QueryData.gotDataAlready) {
      // If QueryData is already populated, we assume we came here through a link
      // e.g. from the browser, so the file data will already be in QueryData,
      // and so will the list of stations.
      var files = this.QueryData.filesQueryData.files;
      var fileObject = files.find((file) => file.name === filename);
      this.$timeout(() => this.SeismoImageMap.loadImage(fileObject));
    } else {
      // Otherwise we assume we came to this route directly, so we have to load
      // the file data and the stations.
      this.$q.all({
        // The stations data is currently needed for showing the station
        // name in the "details" window.
        stations: this.$http({ url: this.ServerUrls.stationsUrl }),
        file: this.$http({ url: this.ServerUrls.fileUrl + "/" + filename })
      }).then((res) => {
        this.QueryData.setStationQueryData(res.stations.data);
        this.SeismoImageMap.loadImage(res.file.data);
      }).catch(() => {
        this.Loading.start("Seismogram not found.");
      });
    }
  }
}

export { ImageMapLoader };
