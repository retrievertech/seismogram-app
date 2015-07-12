class SeismoBrowse {

  constructor($scope, $location, $timeout, SeismoStationMap, SeismoQuery,
              SeismoData, SeismoStatus, Loading) {

    // for debugging
    window.scope = $scope;

    // Referred to in browse.html
    $scope.SeismoData = SeismoData;
    $scope.SeismoStatus = SeismoStatus;
    $scope.SeismoStationMap = SeismoStationMap;

    // Whether the list is visible. When it's false, the map is visible.
    $scope.listVisible = true;
    // Whether the filter/query UI is visible
    $scope.filterVisible = false;

    // The query model is a member of the SeismoQuery service so that it persists across
    // view changes.
    $scope.queryModel = SeismoQuery.model;

    $scope.viewSeismogram = (file) => {
      $scope.go("/view/" + file.name);
    };

    $scope.queryFiles = () => {
      // make the filter UI disappear
      $scope.filterVisible = false;

      Loading.start("Loading results...");

      return SeismoQuery.queryFiles().then((res) => {
        console.log("Query complete.", res.data);

        // update the SeismoData files data
        SeismoData.setFilesQueryData(res.data);
        // update the map
        SeismoStationMap.update();

        Loading.stop("Loading results...");
      });
    };

    var init = () => {
      // If we come here from a different route (e.g. by clicking the back button from
      // another view), we see if the SeismoData service had alrady been populated with
      // data, and load that data instead.
      if (SeismoData.gotDataAlready) {
        $timeout(() => SeismoStationMap.update());
        return;
      }

      // If we didn't come here from a different route, do the initial query --
      // This queries both the /stations and /files endpoints.

      Loading.start("Loading seismograms...");

      SeismoQuery.initialQuery().then((res) => {
        console.log("Initial query complete.", res);

        // populate station data
        SeismoData.setStationQueryData(res.stations.data);
        // populate station data
        SeismoData.setFilesQueryData(res.seismograms.data);
        // drop pins on the map
        SeismoStationMap.update();
        // populate the model (for the filter/query form)
        SeismoQuery.initModel();

        Loading.stop("Loading seismograms...");
      });
    };

    init();
  }
}

export { SeismoBrowse };
