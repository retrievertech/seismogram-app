window.angular.module("seismoApp")
.directive("leafletMap", ["map", function(map) {
  return function(scope, element, attrs) {
    map.init(attrs.id);
  };
}]);