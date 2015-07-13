class SeismoView {
  constructor($scope, $routeParams, $timeout, $http, SeismoEditor, SeismoImageMap,
              Loading, SeismoStatus, SeismoServer, SeismoData) {

    window.viewScope = $scope;

    Loading.reset();

    $scope.SeismoImageMap = SeismoImageMap;
    $scope.Loading = Loading;

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
        var files = SeismoData.filesQueryData.files;
        var fileObject = files.find((file) => file.name === filename);
        $timeout(() => SeismoImageMap.loadImage(fileObject));
      } else {
        $http({url: SeismoServer.fileUrl + "/" + filename}).then((res) => {
          SeismoImageMap.loadImage(res.data);
        }).catch(() => {
          Loading.start("Seismogram not found.");
        });
      }
    };

    main();
  }
}

export { SeismoView };
