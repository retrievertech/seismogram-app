class SeismoEdit {
  constructor($scope, $q, $timeout, $http, $routeParams, Loading, SeismoImageMap,
              SeismoData, SeismoServer, ImageMapLoader) {
    $scope.SeismoImageMap = SeismoImageMap;

    $scope.gotoViewer = () => {
      $scope.go("/view/" + SeismoImageMap.currentFile.name);
    };

    ImageMapLoader.load($routeParams.filename);
  }
}

export { SeismoEdit };
