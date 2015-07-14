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
      return file && (SeismoStatus.hasData(file.status));
    };

    ImageMapLoader.load($routeParams.filename);
  }
}

export { SeismoEdit };
