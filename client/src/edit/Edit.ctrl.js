export class Edit {
  constructor($scope, $routeParams, SeismogramMap, QueryData, SeismogramMapLoader,
              FileStatus, MeanLinesEditor, SegmentErasureEditor, Popup) {

    $scope.SeismogramMap = SeismogramMap;
    $scope.MeanLinesEditor = MeanLinesEditor;
    $scope.SegmentErasureEditor = SegmentErasureEditor;
    $scope.rect = SegmentErasureEditor.rect;
    $scope.Popup = Popup;

    $scope.$on("$locationChangeStart", () => MeanLinesEditor.stopEditing());

    $scope.gotoViewer = () => {
      $scope.go("/view/" + SeismogramMap.currentFile.name);
    };

    $scope.hasData = () => {
      var file = SeismogramMap.currentFile;
      return file && (FileStatus.hasData(file.status));
    };

    var currentEditor = null;
    $scope.startEditing = (editor) => {
      if (currentEditor) {
        currentEditor.stopEditing();
      }
      editor.startEditing();
      currentEditor = editor;
    };

    SeismogramMapLoader.load($routeParams.filename);
  }
}
