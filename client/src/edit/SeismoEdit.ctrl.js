class SeismoEdit {
  constructor($scope, $q, $timeout, $http, $routeParams, Loading, SeismoImageMap,
              SeismoData, SeismoServer, ImageMapLoader, SeismoStatus, SeismoEditor) {
    $scope.SeismoImageMap = SeismoImageMap;

    $scope.gotoViewer = () => {
      $scope.go("/view/" + SeismoImageMap.currentFile.name);
    };

    $scope.hasData = () => {
      var file = SeismoImageMap.currentFile;
      return file && (SeismoStatus.is(file.status, "Complete") ||
                      SeismoStatus.is(file.status, "Edited"));
    };

    $scope.meanLinesEditing = false;
    $scope.meanLinesEdit = () => {
      SeismoEditor.startEditingLayer(SeismoImageMap.getLayer("meanlines"));
      $scope.meanLinesEditing = true;
    };

    $scope.meanLinesAdd = () => {

    };

    ImageMapLoader.load($routeParams.filename);
  }
}

export { SeismoEdit };
