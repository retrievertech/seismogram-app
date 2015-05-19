class SeismoMain {

  constructor($scope, $http, SeismoStationMap,
              SeismoImageMap, SeismoQuery, SeismoServer,
              SeismoData, SeismoEditor, SeismoStatus, PieOverlay, Loading) {
    // debug
    //window.SeismoStationMap = SeismoStationMap;
    //window.SeismoImageMap = SeismoImageMap;
    //window.SeismoQuery = SeismoQuery;

    // add maps and services to scope
    $scope.SeismoStationMap = SeismoStationMap;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.SeismoEditor = SeismoEditor;
    $scope.SeismoStatus = SeismoStatus;
    $scope.PieOverlay = PieOverlay;
    $scope.Loading = Loading;
    $scope.$http = $http;

    // initialize data models and perform initial query
    this.init($scope, SeismoServer);

    $scope.viewSeismogram = (file) => {
      $scope.showImageMap();
      SeismoImageMap.loadImage(file);
    };

    $scope.startProcessing = () => {
      var file = SeismoImageMap.currentFile;
      $http({ url: SeismoServer.processingUrl + "/" + file.name });
    };

    $scope.isProcessing = () => {
      var file = SeismoImageMap.currentFile;
      return file && SeismoStatus.is(file.status, "Processing");
    };

    $scope.canProcess = () => {
      var file = SeismoImageMap.currentFile;
      return file &&
        SeismoData.isLongPeriod(file) &&
        SeismoImageMap.imageIsLoaded &&
        SeismoStatus.is(file.status, "Not Started");
    };

    $scope.canEdit = () => {
      var file = SeismoImageMap.currentFile;
      return file && (SeismoStatus.is(file.status, "Complete") ||
                      SeismoStatus.is(file.status, "Edited"));
    };

    $scope.logShowing = false;
    $scope.log = "";

    $scope.hasLog = () => {
      var file = SeismoImageMap.currentFile;
      return file && (SeismoStatus.is(file.status, "Complete") ||
                      SeismoStatus.is(file.status, "Edited") ||
                      SeismoStatus.is(file.status, "Failed"));
    };

    $scope.showLog = () => {
      var file = SeismoImageMap.currentFile;
      var url = "logs/" + file.name + ".txt";

      $scope.log = "";

      $http({url: url}).then((res) => {
        $scope.log = res.data;
      }).catch(() => {
        $scope.log = "A log is not available for this file...";
      }).then(() => {
        $scope.logShowing = true;
      });
    };

    $scope.hideLog = () => {
      $scope.logShowing = false;
    };

    $scope.imageMapVisible = false;

    $scope.showImageMap = () => {
      $scope.imageMapVisible = true;
    };

    $scope.hideImageMap = () => {
      $scope.imageMapVisible = false;
    };

    $scope.queryStationStatuses = () => {
      Loading.start("Loading results...");
      SeismoQuery.queryFiles($scope.queryParamModel).then((res) => {
        console.log("Query complete.", res.data);
        SeismoData.files = res.data.files;
        SeismoData.stationStatuses = res.data.stations;
        SeismoStationMap.updateBounds();
        PieOverlay.renderStatuses();
        Loading.stop("Loading results...");
      });
    };
  }

  init($scope, SeismoServer) {
    this.initQueryParams($scope);

    $scope.$http({url: SeismoServer.stationsUrl})
      .then((ret) => {
        // stations are loaded; render them
        $scope.SeismoData.stations = ret.data;
        $scope.PieOverlay.renderStations();
        // perform initial query
        $scope.queryStationStatuses();
      });
  }

  initQueryParams($scope) {

    // eventually dateFrom and dateTo should
    // come from the bounds in a query

    $scope.queryParamModel = {
      dateFrom: new Date("1937-10-14T19:26:00Z"),
      dateTo: new Date("1978-09-16T21:20:00Z"),
      stationNames: "",
      status: {}
    };

    $scope.SeismoStatus.statuses.forEach((status) => {
      $scope.queryParamModel.status[status.code] = true;
    });
  }

}

export { SeismoMain };
