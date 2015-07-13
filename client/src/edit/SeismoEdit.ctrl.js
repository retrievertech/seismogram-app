class SeismoEdit {
  constructor($scope, $q, $timeout, $http, $routeParams, Loading, SeismoImageMap,
              SeismoData, SeismoServer, ImageMapLoader, SeismoStatus) {
    $scope.SeismoImageMap = SeismoImageMap;

    $scope.gotoViewer = () => {
      $scope.go("/view/" + SeismoImageMap.currentFile.name);
    };

    $scope.canEdit = () => {
      var file = SeismoImageMap.currentFile;
      return file && (SeismoStatus.is(file.status, "Complete") ||
                      SeismoStatus.is(file.status, "Edited"));
    };

    ImageMapLoader.load($routeParams.filename);
  }
}

export { SeismoEdit };
