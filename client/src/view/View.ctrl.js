export class View {
  constructor($scope, $routeParams, $timeout, $http, $q, SeismogramMap,
              ScreenMessage, FileStatus, ServerUrls, QueryData, SeismogramMapLoader) {

    window.viewScope = $scope;

    ScreenMessage.reset();

    $scope.SeismogramMap = SeismogramMap;
    $scope.QueryData = QueryData;
    $scope.ScreenMessage = ScreenMessage;

    $scope.detailsShowing = false;

    $scope.hasData = () => {
      var file = SeismogramMap.currentFile;
      return file && (FileStatus.hasData(file.status));
    };

    $scope.hasLog = () => {
      var file = SeismogramMap.currentFile;
      return file && (FileStatus.hasLog(file.status));
    };

    $scope.gotoEditor = () => {
      $scope.go("/edit/" + SeismogramMap.currentFile.name);
    };

    $scope.logShowing = false;
    $scope.log = "";

    $scope.showLog = () => {
      var file = SeismogramMap.currentFile;
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

    SeismogramMapLoader.load($routeParams.filename);
  }
}
