var _ = window._;

class SeismoBrowse {

  constructor($scope, $http, $location, SeismoStationMap,
    SeismoImageMap, SeismoQuery, SeismoServer,
    SeismoData, SeismoEditor,
    SeismoStatus, Loading) {

    // add maps and services to scope
    $scope.SeismoStationMap = SeismoStationMap;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.SeismoEditor = SeismoEditor;
    $scope.SeismoStatus = SeismoStatus;
    $scope.Loading = Loading;

    $scope.listVisible = true;
    $scope.filterVisible = false;
    $scope.numRestults = 0;

    $scope.go = (path) => {
      $location.path(path);
    };

    $scope.viewSeismogram = (file) => {
      // TODO go to /view
    };

    $scope.queryStationStatuses = () => {
      Loading.start("Loading results...");
      return SeismoQuery.queryFiles($scope.queryParamModel)
        .then((res) => {
          console.log("Query complete.", res.data);
          $scope.update(res.data);
          $scope.filterVisible = false;
          Loading.stop("Loading results...");
        });
    };

    $scope.update = (data) => {
      // update SeismoData
      SeismoData.setFiles(data.files);
      SeismoData.stationStatuses = data.stations;
      $scope.numResults = data.numResults;

      // update SeismoStationMap
      SeismoStationMap.updateBounds();

      SeismoStationMap.renderQueryData();
    };

    $scope.initQueryModel = (queryModel) => {
      var defaultQueryModel = {
        dateFrom: "",
        dateTo: "",
        numBins: 200,
        stationNames: "",
        fileNames: "",
        status: {}
      };

      $scope.SeismoStatus.statuses.forEach((status) => {
        defaultQueryModel.status[status.code] = true;
      });

      $scope.queryParamModel = _.extend(defaultQueryModel, queryModel);
    };

    $scope.init = () => {
      // perform initial queries to fetch low/high dates,
      // histogram, and station info
      SeismoQuery.initialQuery()
        .then((res) => {
          console.log("Initial query complete.", res);

          // stations are loaded; render station backgrounds
          var stationsResult = res.stations.data;
          $scope.SeismoData.stations = stationsResult;
          //$scope.SeismoStationMap.renderStations();

          // files stats are loaded; render histogram background
          var seismoResult = res.seismograms.data,
              lowDate = new Date(seismoResult.lowDate),
              highDate = new Date(seismoResult.highDate),
              numBins = seismoResult.numBins;

          var initialQueryParams = { dateFrom: lowDate, dateTo: highDate, numBins: numBins };

          $scope.initQueryModel(initialQueryParams);
          return $scope.queryStationStatuses();
        });
    };

    $scope.init();
  }
}

export { SeismoBrowse };
