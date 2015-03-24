var L = window.L;

class MainCtrl {

  constructor($scope, $http, map, seismoQuery) {
    var log = function(base, exp) {
      return Math.log(exp) / Math.log(base);
    };

    var seismogramArea = 0.5; // pixels
    $http({url: seismoQuery.path("/stations")}).then(function(ret) {
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

    $scope.doQuery = function(params) {
      seismoQuery.doQuery(params).then(function(res) {
        // update model
      });
    }
  }

}

export { MainCtrl }