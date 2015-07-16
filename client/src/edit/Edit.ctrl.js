var infoOpened = false;

export class Edit {
  constructor($scope, $routeParams, SeismogramMap, QueryData, SeismogramMapLoader,
              FileStatus, MeanLinesEditor, SegmentErasureEditor, Popup, DataHandler) {

    $scope.SeismogramMap = SeismogramMap;
    $scope.MeanLinesEditor = MeanLinesEditor;
    $scope.SegmentErasureEditor = SegmentErasureEditor;
    // A little shorthand for the rectangle.
    $scope.rect = SegmentErasureEditor.rect;
    $scope.Popup = Popup;

    $scope.$on("$locationChangeStart", () => $scope.stopEditing());

    $scope.gotoViewer = () => {
      $scope.go("/view/" + SeismogramMap.currentFile.name);
    };

    $scope.hasData = () => {
      var file = SeismogramMap.currentFile;
      return file && (FileStatus.hasData(file.status));
    };

    // Whether we show tool info
    $scope.infoVisible = false;

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

      if (!infoOpened) {
        $scope.infoVisible = true;
        infoOpened = true;
      }
    };

    $scope.stopEditing = () => {
      if (currentEditor) {
        currentEditor.stopEditing();
      }

      $scope.infoVisible = false;
    };

    $scope.saveChanges = () => {
      Popup.open("This action will upload the current data to the server. Proceed?", () => {
        DataHandler.saveChanges();
      });
    };

    $scope.discardChanges = () => {
      Popup.open("This action will roll back to the last save. Proceed?", () => {
        if (currentEditor) {
          $scope.infoVisible = false;
          currentEditor.stopEditing();
        }
        DataHandler.discardChanges();
      });
    };

    $scope.download = () => DataHandler.downloadFiles();

    SeismogramMapLoader.load($routeParams.filename);
  }
}
