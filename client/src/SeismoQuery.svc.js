var serverUrl = "http://localhost:3000",
    queryUrl = "http://localhost:3000/query";

class SeismoQuery {
  constructor($http) {
    this.http = $http;
  }
  
  path(path) {
    return serverUrl + path;
  }
  
  doQuery(params) {
    return this.http({
      method: "GET",
      url: queryUrl,
      params: params
    });
  }
}

export { SeismoQuery }