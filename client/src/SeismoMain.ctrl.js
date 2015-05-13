class SeismoMain {

  constructor($scope, $http, SeismoStationMap,
    SeismoImageMap, SeismoQuery, SeismoServer,
    SeismoData, SeismoEditor, PieOverlay, Loading) {
    // debug
    //window.SeismoStationMap = SeismoStationMap;
    //window.SeismoImageMap = SeismoImageMap;
    //window.SeismoQuery = SeismoQuery;

    // add maps and services to scope
    $scope.SeismoStationMap = SeismoStationMap;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.SeismoEditor = SeismoEditor;
    $scope.PieOverlay = PieOverlay;
    $scope.Loading = Loading;
    $scope.$http = $http;

    // initialize data models and perform initial query
    this.init($scope, SeismoServer);

    $scope.viewSeismogram = (file) => {
      $scope.showImageMap();
      SeismoImageMap.loadImage(file.name);
    };

    $scope.editing = false;

    $scope.startEditing = () => {
      $scope.editing = true;
    };

    $scope.exitEditing = () => {
      SeismoEditor.stopEditing();
      $scope.editing = false;
    };

    $scope.imageMapVisible = false;

    $scope.showImageMap = () => {
      $scope.imageMapVisible = true;
    };

    $scope.hideImageMap = () => {
      $scope.imageMapVisible = false;
    };

    $scope.queryStationStatuses = () => {
      var query = $scope.makeQueryParams();
      console.log("Doing query with params", query);
      Loading.start("Loading results...");
      SeismoQuery.queryFiles(query).then((res) => {
        console.log("Query complete.", res.data);
        SeismoData.files = res.data.files;
        SeismoData.stationStatuses = res.data.stations;
        SeismoStationMap.updateBounds();
        PieOverlay.renderStatuses();
        Loading.stop();
      });
    };

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

      var stationIds = SeismoData.stations
        .filter((station) => stationNames.find((stationName) =>
          station.location.toLowerCase().indexOf(stationName.toLowerCase()) !== -1 ||
          station.code.toLowerCase().indexOf(stationName.toLowerCase()) !== -1
        ))
        .map((station) => station.stationId);

      // If the text box is *not* empty (so the user did enter a query)
      // and this query matches no station ids or codes, we send the
      // server an impossible code, so it returns no results.

      // Obviously, there seems like a shorter way to express zero results
      // than to give the server a zero-result query.

      // I realize there is a bit of ambiguity here, essentially telling
      // the client to handle part of the query by itself.

      if (stationNames[0] !== "" && stationIds.length === 0)
        stationIds.push("xxxx");

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
    };

  }

  init($scope, SeismoServer) {
    this.setDefaultQueryParams($scope);

    $scope.SeismoStationMap.deferred.promise.then(() => {
      // the map is initialized; initiaize the pies
      $scope.PieOverlay.init($scope.SeismoStationMap.leafletMap);
      // load the stations
      return $scope.$http({url: SeismoServer.stationsUrl});
    }).then((ret) => {
      // stations are loaded; render them
      $scope.SeismoData.stations = ret.data;
      $scope.PieOverlay.renderStations();
      // perform initial query
      $scope.queryStationStatuses();
    });
  }

  setDefaultQueryParams($scope) {

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
