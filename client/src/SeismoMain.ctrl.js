class SeismoMain {

  constructor($scope, $http, SeismoMap, SeismoQuery) {

    // debug
    window.SeismoMap = SeismoMap;
    window.SeismoQuery = SeismoQuery;

    // temporary for testing
    $http({url: SeismoQuery.path("/stations")}).then((ret) => {
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

    $scope.queryStations = (params) => {
      return SeismoQuery.queryStations(params).then((res) => {
        var stations = res.data.stations;
        if (stations) {
          SeismoMap.pieOverlay.setStationStatusModel(stations);
        }
      });
    };

    $scope.doQuery = () => {
      var statusParams = $scope.statusParams,
          dateParams = $scope.dateParams;

      var status = [];
      if (statusParams.notStarted) status.push(0);
      if (statusParams.inProgress) status.push(1);
      if (statusParams.needsAttention) status.push(2);
      if (statusParams.complete) status.push(3);

      // TODO: convert statusParams.stationNames into stationIds

      var params = {
        dateFrom: new Date(dateParams.dateFrom),
        dateTo: new Date(dateParams.dateTo),
        // stationIds: stationIds
        status: status.join(","),
        edited: statusParams.editedByMe
      };

      console.log("Doing query with params", params);
      $scope.queryStations(params).then(() => {
        console.log("Query complete.");
      });
    }

  }

}

export { SeismoMain };
