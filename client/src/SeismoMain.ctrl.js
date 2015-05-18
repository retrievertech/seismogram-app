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
      SeismoQuery.queryFiles($scope.queryParamModel).then((res) => {
        console.log("Query complete.", res.data);
        
        SeismoData.files = res.data.files;
        SeismoData.stationStatuses = res.data.stations;
        
        SeismoStationMap.updateBounds();
        PieOverlay.renderStatuses();

        var numBins = $scope.queryParamModel.bins;
        var histogramObject = res.data.histogram,
            histogramArray = [];
        for (var i = 0; i < numBins; i++) {
          if (i in histogramObject) {
            histogramArray[i] = histogramObject[i];
          } else {
            histogramArray[i] = 0;
          }
        }
        SeismoHistogram.render(histogramArray);
        
        Loading.stop("Loading results...");
      });
    };
  }

  init($scope, SeismoServer) {
    this.initQueryParams($scope);

    var lowDate = $scope.queryParamModel.dateFrom,
        highDate = $scope.queryParamModel.dateTo,
        numBins = $scope.queryParamModel.bins;
    
    $scope.$timeout(() => $scope.SeismoHistogram.setScale(lowDate, highDate, numBins));

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
      dateFrom: new Date("1937-10-14T12:26:00.000Z"),
      dateTo: new Date("1978-09-16T14:20:00.000Z"),
      stationNames: "",
      notStarted: true,
      inProgress: true,
      needsAttention: true,
      complete: true,
      editedByMe: false,
      bins: 200
    };
  }

}

export { SeismoMain };
