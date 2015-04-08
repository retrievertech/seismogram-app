class SeismoServer {
  constructor($location) {
    var port = 3000;
    this.url = $location.protocol() + "://" + $location.host() + ":" + port;
    this.searchUrl = this.url + "/query/search";
    this.stationsUrl = this.url + "/query/stations";
    this.tilesUrl = this.url + "/tiles";
  }
}

export { SeismoServer };
