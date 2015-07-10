class SeismoView {
  constructor($scope, SeismoEditor, SeismoImageMap, Loading, SeismoStatus, SeismoServer, SeismoData, $timeout, $http) {
    $scope.SeismoEditor = SeismoEditor;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.Loading = Loading;

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
        (SeismoStatus.is(file.status, "Not Started") ||
        SeismoStatus.is(file.status, "Failed"));
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


    $timeout(() => {
      SeismoImageMap.loadImage({
        name: "010175_0000_0026_04.png",
        status: 3
      });
    });
  }
}

export { SeismoView };
