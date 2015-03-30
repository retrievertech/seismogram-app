var serverUrl = "http://localhost:3000",
    queryUrl = serverUrl + "/query";

class SeismoQuery {
  constructor($http) {
    this.http = $http;
  }
  
  path(path) {
    return serverUrl + path;
  }
  
  queryStations(params) {
    return this.http({
      method: "GET",
      url: queryUrl,
      params: params
    });
  }
}

export { SeismoQuery };
