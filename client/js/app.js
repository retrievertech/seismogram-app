import {Leaflet} from "../bower_components/redfish-core/lib/Leaflet.js";
import {Gradient} from "../bower_components/redfish-core/lib/Util/Gradient.js";

var angular = window.angular;
var L = window.L;
var seismoApp = angular.module("seismoApp", []);

var serverUrl = "http://localhost:3000";
var server = function(path) {
  return serverUrl + path;
};

seismoApp.run(["$rootScope", function($rootScope) {
  console.log("Seismo is running.");
  $rootScope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase === "$apply" || phase === "$digest") {
      if(fn && (typeof(fn) === "function")) fn();
    } else {
      this.$apply(fn);
    }
  };
}]);

seismoApp.service("map", [function() {
  return {
    map: null,
    leafletMap: null,
    init: function(id) {
      var map = this.map = new Leaflet(id, null, {minZoom: 1});
      this.leafletMap = map.leafletMap;
      map.leafletMap.setView(new L.LatLng(0,0), 3);
      map.addLayers();
      map.setBaseLayer(map.baseLayers[3]);
    }
  };
}]);

seismoApp.directive("leafletMap", ["map", function(map) {
  return function(scope, element, attrs) {
    map.init(attrs.id);
  };
}]);

seismoApp.controller("mainCtrl", ["$http", "map", function(http, map) {
  var log = function(base, exp) {
    return Math.log(exp) / Math.log(base);
  };
  var seismogramArea = 0.5; // pixels
  http({url: server("/stations")}).then(function(ret) {
    var stations = ret.data;
    stations.forEach(function(station) {
      if (station.lat === null || station.lon === null)
        return;
      var circleArea = seismogramArea * station.numFiles;
      var radius = log(1.1,Math.sqrt(circleArea / Math.PI));
      var marker = L.circleMarker(new L.LatLng(station.lat, station.lon), {
        fillColor: "#044",
        fillOpacity: 0.7,
        radius: radius,
        opacity: 0
      });
      marker.addTo(map.leafletMap);
      var popup = L.popup().setContent(
        station.location + "<br/>" +
        "<b>" + station.numFiles + "</b> files."
      );
      marker.bindPopup(popup);
    });
  });
}]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ["seismoApp"]);
});

