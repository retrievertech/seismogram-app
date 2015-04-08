class SeismoQuery {
  constructor($http, SeismoServer) {
    this.http = $http;
    this.server = SeismoServer;
  }
  
  queryStations(params) {
    return this.http({
      method: "GET",
      url: this.server.queryUrl,
      params: params
    });
  }
}

export { SeismoQuery };
