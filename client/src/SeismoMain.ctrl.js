class SeismoMain {

  constructor($scope, $http, SeismoMap, SeismoQuery) {

    // debug
    window.SeismoMap = SeismoMap;
    window.SeismoQuery = SeismoQuery;

    // temporary for testing
    $http({url: SeismoQuery.path("/stations")}).then(function(ret) {
      var stations = ret.data;
      SeismoMap.pieOverlay.setStationModel(stations);
      $scope.queryStations();
    });

    // queryParams = {
    //   dateFrom: "",
    //   dateTo: "",
    //   stationIds: [],
    //   status: [0, 1, 2, 3], // 0: not started; 1: ongoing; 2: needs attention; 3: complete
    //   edited: null, // True if you want only seismograms you've edited
    //   page: 0 // each page returns 40 results
    // }

    $scope.queryStations = function(params) {
      return SeismoQuery.queryStations(params).then(function(res) {
        var stations = res.data.stations;
        if (stations) {
          SeismoMap.pieOverlay.setStationStatusModel(stations);
        }
      });
    };

  }

}

export { SeismoMain };
