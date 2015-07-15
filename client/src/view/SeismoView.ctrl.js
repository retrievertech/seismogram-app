class SeismoView {
  constructor($scope, $routeParams, $timeout, $http, $q, SeismoImageMap,
              Loading, FileStatus, ServerUrls, QueryData, ImageMapLoader) {

    window.viewScope = $scope;

    Loading.reset();

    $scope.SeismoImageMap = SeismoImageMap;
    $scope.QueryData = QueryData;
    $scope.Loading = Loading;

    $scope.detailsShowing = false;

    $scope.hasData = () => {
      var file = SeismoImageMap.currentFile;
      return file && (FileStatus.hasData(file.status));
    };

    $scope.gotoEditor = () => {
      $scope.go("/edit/" + SeismoImageMap.currentFile.name);
    };

    $scope.logShowing = false;
    $scope.log = "";

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

    ImageMapLoader.load($routeParams.filename);
  }
}

export { SeismoView };
