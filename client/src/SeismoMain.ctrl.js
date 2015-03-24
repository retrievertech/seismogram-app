var L = window.L;

class SeismoMain {

  constructor($scope, $http, SeismoMap, SeismoQuery) {
    var log = function(base, exp) {
      return Math.log(exp) / Math.log(base);
    };

    // debug
    window.SeismoMap = SeismoMap;
    window.SeismoQuery = SeismoQuery;

    var seismogramArea = 0.5; // pixels
    $http({url: SeismoQuery.path("/stations")}).then(function(ret) {
      var stations = ret.data;

      SeismoMap.pieOverlay.storeData(stations);

    //   stations.forEach(function(station) {
    //     if (station.lat === null || station.lon === null)
    //       return;
    //     var circleArea = seismogramArea * station.numFiles;
    //     var radius = log(1.1,Math.sqrt(circleArea / Math.PI));
    //     var marker = L.circleMarker(new L.LatLng(station.lat, station.lon), {
    //       fillColor: "#044",
    //       fillOpacity: 0.7,
    //       radius: radius,
    //       opacity: 0
    //     });
    //     console.log(radius);
    //     marker.addTo(SeismoMap.leafletMap);
    //     var popup = L.popup().setContent(
    //       station.location + "<br/>" +
    //       "<b>" + station.numFiles + "</b> files."
    //     );
    //     marker.bindPopup(popup);
    //   });

    });

    $scope.doQuery = function(params) {
      SeismoQuery.doQuery(params).then(function(res) {
        // update model
      });
    }
  }

}

export { SeismoMain }