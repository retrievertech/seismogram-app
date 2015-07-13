class SeismoView {
  constructor($scope, $routeParams, $timeout, $http, $q, SeismoEditor, SeismoImageMap,
              Loading, SeismoStatus, SeismoServer, SeismoData) {

    window.viewScope = $scope;

    Loading.reset();

    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.Loading = Loading;

    $scope.detailsShowing = false;

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
      var token = Math.random();
      var url = "logs/" + file.name + ".txt?token="+token;

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

    var main = () => {
      var filename = $routeParams.filename;

      if (SeismoData.gotDataAlready) {
        // If SeismoData is already populated, we assume we came here through a link
        // e.g. from the browser, so the file data will already be in SeismoData,
        // and so will the list of stations.
        var files = SeismoData.filesQueryData.files;
        var fileObject = files.find((file) => file.name === filename);
        $timeout(() => SeismoImageMap.loadImage(fileObject));
      } else {
        // Otherwise we assume we came to this route directly, so we have to load
        // the file data and the stations.
        $q.all({
          // The stations data is currently needed for showing the station
          // name in the "details" window.
          stations: $http({ url: SeismoServer.stationsUrl }),
          file: $http({ url: SeismoServer.fileUrl + "/" + filename })
        }).then((res) => {
          SeismoData.setStationQueryData(res.stations.data);
          SeismoImageMap.loadImage(res.file.data);
        }).catch(() => {
          Loading.start("Seismogram not found.");
        });
      }
    };

    main();
  }
}

export { SeismoView };
