class SeismoView {
  constructor($scope, SeismoEditor, SeismoImageMap, Loading, $timeout) {
    $scope.SeismoEditor = SeismoEditor;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.Loading = Loading;

    $timeout(() => {
      SeismoImageMap.loadImage({
        name: "010175_0000_0026_04.png",
        status: 3
      });
    });
  }
}

export { SeismoView };
