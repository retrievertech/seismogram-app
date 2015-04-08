class SeismoQuery {
  constructor($http, SeismoServer) {
    this.http = $http;
    this.server = SeismoServer;
  }
  
  queryStations(params) {
    return this.http({
      method: "GET",
      url: this.server.searchUrl,
      params: params
    });
  }
}

export { SeismoQuery };
