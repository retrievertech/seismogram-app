class SeismoMain {

  constructor($scope, $http, SeismoMap, SeismoQuery) {

    // debug
    window.SeismoMap = SeismoMap;
    window.SeismoQuery = SeismoQuery;

    this.setDefaultQueryParams($scope);

    // temporary for testing
    $http({url: SeismoQuery.path("/stations")}).then((ret) => {
      var stations = ret.data;
      SeismoMap.pieOverlay.setStationModel(stations);
      $scope.queryStationStatuses();
    });

    $scope.doQuery = (query) => {
      return SeismoQuery.queryStations(query).then((res) => {
        var stationStatus = res.data.stations;
        if (stationStatus) {
          SeismoMap.pieOverlay.setStationStatusModel(stationStatus);
        }
        return stationStatus;
      });
    };

    $scope.queryStationStatuses = () => {
      var query = $scope.makeQueryParams();
      console.log("Doing query with params", query);
      $scope.doQuery(query).then((statuses) => {
        console.log("Query complete.", statuses);
      });
    }

    $scope.makeQueryParams = () => {

      // The server expects something that looks like:
      // {
      //   dateFrom: "",
      //   dateTo: "",
      //   stationIds: [],
      //   status: [0, 1, 2, 3], // 0: not started; 1: ongoing; 2: needs attention; 3: complete
      //   edited: null, // True if you want only seismograms you've edited
      //   page: 0 // each page returns 40 results
      // }

      var queryParamModel = $scope.queryParamModel;

      var stationNames = queryParamModel.stationNames
        .split(",").map((stationName) => stationName.trim());
      var stationIds = SeismoMap.pieOverlay.stationModel
        .filter((station) => stationNames.indexOf(station.code) !== -1)
        .map((station) => station.stationId);

      var status = [];
      if (queryParamModel.notStarted) status.push(0);
      if (queryParamModel.inProgress) status.push(1);
      if (queryParamModel.needsAttention) status.push(2);
      if (queryParamModel.complete) status.push(3);

      var query = {
        dateFrom: new Date(queryParamModel.dateFrom),
        dateTo: new Date(queryParamModel.dateTo),
        stationIds: stationIds.join(","),
        status: status.join(","),
        edited: queryParamModel.editedByMe
      };

      return query;
    }

  }

  setDefaultQueryParams ($scope) {

    // eventually dateFrom and dateTo should
    // come from the bounds in a query

    $scope.queryParamModel = {
      dateFrom: new Date("1937-10-14T19:26:00Z"),
      dateTo: new Date("1978-09-16T21:20:00Z"),
      stationNames: "",
      notStarted: true,
      inProgress: true,
      needsAttention: true,
      complete: true,
      editedByMe: false
    };
  }

}

export { SeismoMain };
