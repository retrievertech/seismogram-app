class SeismoEdit {
  constructor($scope, $routeParams, SeismoImageMap, SeismoData, ImageMapLoader,
              SeismoStatus, MeanLinesEditor, Popup) {

    $scope.SeismoImageMap = SeismoImageMap;
    $scope.MeanLinesEditor = MeanLinesEditor;
    $scope.Popup = Popup;

    $scope.gotoViewer = () => {
      $scope.go("/view/" + SeismoImageMap.currentFile.name);
    };

    $scope.hasData = () => {
      var file = SeismoImageMap.currentFile;
      return file && (SeismoStatus.is(file.status, "Complete") ||
                      SeismoStatus.is(file.status, "Edited"));
    };

    ImageMapLoader.load($routeParams.filename);
  }
}

export { SeismoEdit };
