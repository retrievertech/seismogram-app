export class Browse {

  constructor($scope, $location, $timeout, StationMap, Query,
              QueryData, FileStatus, ScreenMessage) {

    // for debugging
    window.scope = $scope;

    ScreenMessage.reset();

    // Referred to in browse.html
    $scope.QueryData = QueryData;
    $scope.FileStatus = FileStatus;
    $scope.StationMap = StationMap;

    // Whether the list is visible. When it's false, the map is visible.
    $scope.listVisible = true;
    // Whether the filter/query UI is visible
    $scope.filterVisible = false;

    StationMap.setStationCallback((station) => {
      // Query.model.stationNames = station.location.split(",")[0];
      Query.model.stationNames = station.code;
      $scope.queryFiles();
      $scope.listVisible = true;
    });

    $scope.resetFilter = () => {
      Query.model.stationNames = "";
      $scope.queryFiles();
    }

    // The query model is a member of the Query service so that it persists across
    // view changes.
    $scope.queryModel = Query.model;

    $scope.viewSeismogram = (file) => {
      $scope.go("/view/" + file.name);
    };

    $scope.queryFiles = () => {
      // make the filter UI disappear
      $scope.filterVisible = false;

      ScreenMessage.start("Loading results...");

      return Query.queryFiles().then((res) => {
        console.log("Query complete.", res.data);

        // update the QueryData files data
        QueryData.setFilesQueryData(res.data);
        // update the map
        StationMap.update();

        ScreenMessage.stop("Loading results...");
      });
    };

    $scope.loadMoreFiles = () => {
      return Query.moreFiles().then((res) => {
        console.log("Query complete.", res.data);
        // update the QueryData files data
        QueryData.moreFilesData(res.data);
      });
    };

    var main = () => {
      // If we come here from a different route (e.g. by clicking the back button from
      // another view), we see if the QueryData service had alrady been populated with
      // data, and load that data instead.
      if (QueryData.gotDataAlready) {
        $timeout(() => StationMap.update());
        return;
      }

      // If we didn't come here from a different route, do the initial query --
      // This queries both the /stations and /files endpoints.

      ScreenMessage.start("Loading seismograms...");

      Query.initialQuery().then((res) => {
        console.log("Initial query complete.", res);

        // populate station data
        QueryData.setStationQueryData(res.stations.data);
        // populate station data
        QueryData.setFilesQueryData(res.seismograms.data);
        // drop pins on the map
        StationMap.update();
        // populate the model (for the filter/query form)
        Query.initModel();

        ScreenMessage.stop("Loading seismograms...");
      }).catch(() => {
        ScreenMessage.stop("Loading seismograms...");
      });
    };

    main();
  }
}
