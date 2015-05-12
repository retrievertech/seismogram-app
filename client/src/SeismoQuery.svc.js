class SeismoQuery {
  constructor($http, SeismoServer) {
    this.http = $http;
    this.SeismoServer = SeismoServer;
  }
  
  queryFiles(params) {
    return this.http({
      method: "GET",
      url: this.SeismoServer.filesUrl,
      params: params
    });
  }
}

export { SeismoQuery };
