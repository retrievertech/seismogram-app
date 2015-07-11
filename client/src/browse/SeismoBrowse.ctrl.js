var _ = window._;

class SeismoBrowse {

  constructor($scope, $http, $location, SeismoStationMap,
    SeismoImageMap, SeismoQuery, SeismoServer,
    SeismoData, SeismoEditor,
    SeismoStatus, Loading, $timeout) {

    // add maps and services to scope
    $scope.SeismoStationMap = SeismoStationMap;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.SeismoEditor = SeismoEditor;
    $scope.SeismoStatus = SeismoStatus;
    $scope.Loading = Loading;

    $scope.listVisible = true;
    $scope.filterVisible = false;

    $scope.viewSeismogram = (file) => {
      $scope.go("/view/" + file.name);
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
      SeismoData.setFilesQueryData(data);
      SeismoStationMap.update();
    };

    $scope.initQueryModel = (queryModel) => {
      var defaultQueryModel = {
        dateFrom: new Date(SeismoData.filesQueryData.lowDate),
        dateTo: new Date(SeismoData.filesQueryData.highDate),
        numBins: SeismoData.filesQueryData.numBins,
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
      if (SeismoData.gotDataAlready) {
        $timeout(() => {
          $scope.initQueryModel({
            dateFrom: new Date(SeismoData.filesQueryData.lowDate),
            dateTo: new Date(SeismoData.filesQueryData.highDate),
            numBins: SeismoData.filesQueryData.numBins
          });
          SeismoStationMap.update();
        });
        return;
      }
      SeismoQuery.initialQuery()
        .then((res) => {
          console.log("Initial query complete.", res);

          // populate station data
          $scope.SeismoData.setStationQueryData(res.stations.data);
          // update UI with histogram data
          $scope.update(res.seismograms.data);
          // populate the model (for the filter/query form) with bounds data
          $scope.initQueryModel({
            dateFrom: new Date(res.seismograms.data.lowDate),
            dateTo: new Date(res.seismograms.data.highDate),
            numBins: res.seismograms.data.numBins
          });
        });
    };

    $scope.init();
  }
}

export { SeismoBrowse };
