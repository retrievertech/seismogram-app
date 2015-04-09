class SeismoQuery {
  constructor($http, SeismoServer) {
    this.http = $http;
    this.server = SeismoServer;
  }
  
  queryFiles(params) {
    return this.http({
      method: "GET",
      url: this.server.filesUrl,
      params: params
    });
  }
}

export { SeismoQuery };
