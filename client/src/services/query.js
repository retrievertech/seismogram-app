window.angular.module("seismoApp")
.service("query", [function() {
  var serverUrl = "http://localhost:3000";
  return {
    path: function(path) {
      return serverUrl + path;
    }
  };
}]);