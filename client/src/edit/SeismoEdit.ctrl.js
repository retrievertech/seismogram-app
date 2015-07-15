class SeismoEdit {
  constructor($scope, $routeParams, SeismoImageMap, QueryData, ImageMapLoader,
              FileStatus, MeanLinesEditor, Popup) {

    $scope.SeismoImageMap = SeismoImageMap;
    $scope.MeanLinesEditor = MeanLinesEditor;
    $scope.Popup = Popup;

    $scope.$on("$locationChangeStart", () => MeanLinesEditor.stopEditing());

    $scope.gotoViewer = () => {
      $scope.go("/view/" + SeismoImageMap.currentFile.name);
    };

    $scope.hasData = () => {
      var file = SeismoImageMap.currentFile;
      return file && (FileStatus.hasData(file.status));
    };

    ImageMapLoader.load($routeParams.filename);
  }
}

export { SeismoEdit };
