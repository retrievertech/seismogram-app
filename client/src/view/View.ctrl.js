export class View {
  constructor($scope, $routeParams, $timeout, $http, $q, SeismogramMap, $location,
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

      var url;

      // TODO: Abstract this dev/prod logic; see also SeismogramMap.svc.js
      if ($location.host() === "localhost") {
        // we are in development
        url = "https://s3.amazonaws.com/wwssn-logs/";
      } else {
        // in production
        // maybe switch to this?
        // nginx gzip proxy to s3
        // url = "/s3/logs/";
        url = "https://s3.amazonaws.com/wwssn-logs/";
      }

      url += file.name + "/log.txt?token="+token;

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
