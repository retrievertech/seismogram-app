var _ = window._;

class SeismoBrowse {

  constructor($scope, $http, $location, SeismoStationMap,
    SeismoImageMap, SeismoQuery, SeismoServer,
    SeismoData, SeismoEditor, SeismoHistogram,
    SeismoStatus, PieOverlay, Loading) {

    // add maps and services to scope
    $scope.SeismoStationMap = SeismoStationMap;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoHistogram = SeismoHistogram;
    $scope.SeismoData = SeismoData;
    $scope.SeismoEditor = SeismoEditor;
    $scope.SeismoStatus = SeismoStatus;
    $scope.PieOverlay = PieOverlay;
    $scope.Loading = Loading;

    $scope.viewSeismogram = (file) => {
      // TODO go to /view
    };

    $scope.queryStationStatuses = () => {
      Loading.start("Loading results...");
      return SeismoQuery.queryFiles($scope.queryParamModel)
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
      // PieOverlay.renderStatuses();

      // update SeismoHistogram
      //SeismoHistogram.renderOverlay(data.histogram);
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
          //$scope.PieOverlay.renderStations();

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
