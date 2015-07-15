export class Edit {
  constructor($scope, $routeParams, SeismogramMap, QueryData, SeismogramMapLoader,
              FileStatus, MeanLinesEditor, Popup) {

    $scope.SeismogramMap = SeismogramMap;
    $scope.MeanLinesEditor = MeanLinesEditor;
    $scope.Popup = Popup;

    $scope.$on("$locationChangeStart", () => MeanLinesEditor.stopEditing());

    $scope.gotoViewer = () => {
      $scope.go("/view/" + SeismogramMap.currentFile.name);
    };

    $scope.hasData = () => {
      var file = SeismogramMap.currentFile;
      return file && (FileStatus.hasData(file.status));
    };

    SeismogramMapLoader.load($routeParams.filename);
  }
}
