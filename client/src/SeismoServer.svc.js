class SeismoServer {
  constructor($location) {
    var port = 3000;
    this.url = $location.protocol() + "://" + $location.host() + ":" + port;
    this.queryUrl = this.url + "/query";
    this.tilesUrl = this.url + "/tiles";
    this.loadfileUrl = this.tilesUrl + "/loadfile";
    this.stationsUrl = this.url + "/stations";
  }
}

export { SeismoServer };
