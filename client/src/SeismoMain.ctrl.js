var L = window.L;

class SeismoMain {

  constructor($scope, $http, SeismoMap, SeismoQuery) {

    // debug
    window.SeismoMap = SeismoMap;
    window.SeismoQuery = SeismoQuery;

    $http({url: SeismoQuery.path("/stations")}).then(function(ret) {
      var stations = ret.data;

      SeismoMap.pieOverlay.storeData(stations);


    });

    $scope.doQuery = function(params) {
      SeismoQuery.doQuery(params).then(function(res) {
        // update model
      });
    }
  }

}

export { SeismoMain }