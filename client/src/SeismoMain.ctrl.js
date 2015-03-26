var L = window.L;

class SeismoMain {

  constructor($scope, $http, SeismoMap, SeismoQuery) {

    // debug
    window.SeismoMap = SeismoMap;
    window.SeismoQuery = SeismoQuery;

    // temporary for testing
    $http({url: SeismoQuery.path("/stations")}).then(function(ret) {
      var stations = ret.data;
      SeismoMap.pieOverlay.setStationModel(stations);
      $scope.doQuery();
    });



    });

    $scope.doQuery = function(params) {
      return SeismoQuery.doQuery(params).then(function(res) {
        var stations = res.data.stations;
        if (stations) {
          SeismoMap.pieOverlay.setStationStatusModel(stations);
        }
      });
    }

  }

}

export { SeismoMain }