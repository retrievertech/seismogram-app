class SeismoMain {

  constructor($scope, $http, $location, SeismoStationMap,
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
      $scope.updateUrl();
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
    };

    $scope.updateUrl = () => {
      $location.search(escapeQueryParams($scope.queryParamModel));
    }

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
    }

    $scope.init = () => {
      // perform initial queries to fetch low/high dates,
      // histogram, and station info
      SeismoQuery.initialQuery().then((res) => {
        console.log("Initial query complete.", res);

        // stations are loaded; render station backgrounds
        var stationsResult = res.stations.data;
        $scope.SeismoData.stations = stationsResult;
        $scope.PieOverlay.renderStations();

        // files stats are loaded; render histogram background
        var seismoResult = res.seismograms.data,
            lowDate = new Date(seismoResult.lowDate),
            highDate = new Date(seismoResult.highDate),
            numBins = seismoResult.numBins,
            data = seismoResult.histogram;
        SeismoHistogram.initBackground(lowDate, highDate, numBins, data);

        // parse url query params
        var urlQueryParams = $location.search(),
            initialQueryParams;
            
        if (_.isEmpty(urlQueryParams)) {
          // no query parameters passed in with the url; use results from files query
          initialQueryParams = { dateFrom: lowDate, dateTo: highDate, numBins: numBins };
        } else {
          // use url query parameters 
          initialQueryParams = unescapeQueryParams(urlQueryParams);
        }

        $scope.initQueryModel(initialQueryParams);
        $scope.updateUrl();
        $scope.queryStationStatuses();

      });
    };

    $scope.init();
  }

}

function escapeQueryParams(queryParams) {
  return _.extend(_.clone(queryParams), {
    dateFrom: new Date(queryParams.dateFrom).toJSON(),
    dateTo: new Date(queryParams.dateTo).toJSON(),
    status: Object.keys(queryParams.status)
      .filter((key) => queryParams.status[key] === true).join(",")
  });
}

function unescapeQueryParams(queryParams) {
  return _.extend(_.clone(queryParams), {
    dateFrom: new Date(queryParams.dateFrom).toString(),
    dateTo: new Date(queryParams.dateTo).toString(),
    status: _.object(_.map(queryParams.status.split(","), (val) => [val, true]))
  });
}

export { SeismoMain };
