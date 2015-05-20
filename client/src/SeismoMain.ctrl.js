class SeismoMain {

  constructor($scope, $http, $timeout, SeismoStationMap,
    SeismoImageMap, SeismoQuery, SeismoServer,
    SeismoData, SeismoEditor, SeismoHistogram,
    PieOverlay, Loading) {
    // debug
    //window.SeismoStationMap = SeismoStationMap;
    //window.SeismoImageMap = SeismoImageMap;
    //window.SeismoQuery = SeismoQuery;

    // add maps and services to scope
    $scope.SeismoStationMap = SeismoStationMap;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.SeismoEditor = SeismoEditor;
    $scope.SeismoHistogram = SeismoHistogram;
    $scope.PieOverlay = PieOverlay;
    $scope.Loading = Loading;
    $scope.$http = $http;
    $scope.$timeout = $timeout;

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
      return file && file.status === 1;
    };

    $scope.canProcess = () => {
      var file = SeismoImageMap.currentFile;
      return file && SeismoData.isLongPeriod(file) && SeismoImageMap.imageIsLoaded && file.status === 0;
    };

    $scope.canEdit = () => {
      var file = SeismoImageMap.currentFile;
      return file && file.status === 3;
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
      SeismoHistogram.render(data.histogram);
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
      stationNames: "",
      notStarted: true,
      inProgress: true,
      needsAttention: true,
      complete: true,
      editedByMe: false,
      numBins: query.numBins
    };
  }

}

export { SeismoMain };
