class SeismoMain {

  constructor($scope, $http, SeismoStationMap,
    SeismoImageMap, SeismoQuery, SeismoServer,
    SeismoData, SeismoEditor, SeismoHistogram,
    SeismoStatus, PieOverlay, Loading) {

    // debug
    //window.SeismoStationMap = SeismoStationMap;
    //window.SeismoImageMap = SeismoImageMap;
    //window.SeismoQuery = SeismoQuery;

    // add maps and services to scope
    $scope.SeismoStationMap = SeismoStationMap;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoHistogram = SeismoHistogram;
    $scope.SeismoData = SeismoData;
    $scope.SeismoEditor = SeismoEditor;
    $scope.SeismoStatus = SeismoStatus;
    $scope.PieOverlay = PieOverlay;
    $scope.Loading = Loading;
    $scope.$http = $http;

    // initialize data models and perform initial query
    this.init($scope, SeismoServer, SeismoQuery, SeismoHistogram);

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
      SeismoQuery.queryFiles($scope.queryParamModel)
        .then((res) => {
          console.log("Query complete.", res.data);
          $scope.update(res.data);
          Loading.stop("Loading results...");
        });
    };

    $scope.update = (data) => {
      // update SeismoData
      SeismoData.files = data.files;
      SeismoData.stationStatuses = data.stations;

      // update SeismoStationMap
      SeismoStationMap.updateBounds();

      // update PieOverlay
      PieOverlay.renderStatuses();

      // update SeismoHistogram
      SeismoHistogram.renderOverlay(data.histogram);
    }
  }

  init($scope, SeismoServer, SeismoQuery, SeismoHistogram) {
    $scope.$http({url: SeismoServer.stationsUrl})
      .then((ret) => {
        // stations are loaded; render them
        $scope.SeismoData.stations = ret.data;
        $scope.PieOverlay.renderStations();
        
        // perform initial files query to fetch low/high date
        // and histogram info
        SeismoQuery.initialQuery().then((res) => {
          console.log("Initial query complete.", res.data);

          this.initQueryParams($scope, res.data);

          var lowDate = new Date(res.data.lowDate),
              highDate = new Date(res.data.highDate),
              numBins = res.data.numBins,
              data = res.data.histogram;

          SeismoHistogram.initBackground(lowDate, highDate, numBins, data);

          $scope.update(res.data);
        });
      });
  }

  initQueryParams($scope, query) {

    // eventually dateFrom and dateTo should
    // come from the bounds in a query

    $scope.queryParamModel = {
      dateFrom: new Date(query.lowDate),
      dateTo: new Date(query.highDate),
      numBins: query.numBins,
      stationNames: "",
      status: {}
    };

    $scope.SeismoStatus.statuses.forEach((status) => {
      $scope.queryParamModel.status[status.code] = true;
    });
  }

}

export { SeismoMain };
