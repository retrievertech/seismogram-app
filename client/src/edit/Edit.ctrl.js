export class Edit {
  constructor($scope, $routeParams, SeismogramMap, QueryData, SeismogramMapLoader,
              FileStatus, MeanLinesEditor, SegmentErasureEditor, Popup) {

    $scope.SeismogramMap = SeismogramMap;
    $scope.MeanLinesEditor = MeanLinesEditor;
    $scope.SegmentErasureEditor = SegmentErasureEditor;
    // A little shorthand for the rectangle.
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

    //
    // This little trick lets us keep only one running editor at any time. This implies
    // that the editors respect an interface containing the functions `startEditing()`
    // and `stopEditing()`
    //
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
