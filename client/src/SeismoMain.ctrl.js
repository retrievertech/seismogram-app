class SeismoMain {

  constructor($scope, $http, SeismoStationMap, SeismoImageMap, SeismoQuery, SeismoServer, SeismoData, PieOverlay, Loading) {
    // debug
    //window.SeismoStationMap = SeismoStationMap;
    //window.SeismoImageMap = SeismoImageMap;
    //window.SeismoQuery = SeismoQuery;

    // add maps and services to scope
    $scope.SeismoStationMap = SeismoStationMap;
    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.PieOverlay = PieOverlay;
    $scope.Loading = Loading;
    $scope.$http = $http;

    // initialize data models and perform initial query
    this.init($scope, SeismoServer);

    $scope.viewSeismogram = (file) => {
      $scope.showImageMap();
      SeismoImageMap.loadImage(file);
    };

    $scope.editing = false;
    $scope.layerBeingEdited = null;

    $scope.startEditing = () => {
      $scope.editing = true;
    };

    var stopEditing = function() {
      var layer = $scope.layerBeingEdited;

      if (layer !== null) {
        if (layer.key === "intersections") {
          // for intersections, remove the circle mousedown events
          layer.leafletLayer.getLayers().forEach((circle) => circle.off("mousedown"));
        } else {
          layer.leafletLayer.getLayers().forEach((object) => object.disableEdit());
        }
      }

      $scope.layerBeingEdited = null;
    };

    // catch shift presses, used for editing intersection radii
    var shiftPressed = false;

    document.onkeydown = (e) => {
      if (e.keyCode === 16) shiftPressed = true;
    };

    document.onkeyup = () => {
      shiftPressed = false;
    };

    $scope.startEditingLayer = (layer) => {
      stopEditing();

      // if the layer is off, turn it on
      if (!layer.on) {
        $scope.SeismoImageMap.toggleLayer(layer);
      }

      // not yet for these
      if (layer.key === "segments") {
        return;
      }

      $scope.layerBeingEdited = layer;

      var map = $scope.SeismoImageMap.leafletMap;

      if (layer.key === "intersections") {
        // we have to do a bunch of custom stuff here to get intersection editing to work.

        layer.leafletLayer.getLayers().forEach((circle) => {
          // prevMousePosition holds the previous x-coord of the mouse cursor
          // so we can determine if the mouse is moved to the left or to the right.
          var prevMousePosition = 0;

          // we register mousedown events for moving and radius-sizing
          circle.on("mousedown", (e) => {
            prevMousePosition = e.latlng.lng;

            // once the mouse has been pressed, we catch mousemove events on the map
            map.on("mousemove", (e) => {
              // if shift is pressed while the mouse is down and being moved, we resize
              // the circle's radius, but only at at maximum zoom.

              if (shiftPressed && map.getZoom() === 7) {
                var distance = Math.abs(e.latlng.lng - prevMousePosition);
                var radius = circle.feature.properties.radius;
                var newRadius = radius + distance;

                // if the mouse is moved to the right, we increase the radius.
                // if it's moved to the left, we decrease it.
                if (e.latlng.lng < prevMousePosition) {
                  newRadius = radius - distance;

                  // we never make the radius less than 3px
                  if (radius - distance < 3) {
                    newRadius = 3;
                  }
                }

                // modify the underlying geoJson, too.
                circle.feature.properties.radius = newRadius;
                circle.setRadius(newRadius);

                prevMousePosition = e.latlng.lng;
              } else {
                // if shift is not pressed, we move the marker.
                circle.setLatLng(e.latlng);
              }
            });
          });

          // on mouse up, we disable the mousemove event we just installed
          map.on("mouseup", () => map.removeEventListener("mousemove"));
        });
      } else {
        layer.leafletLayer.getLayers().forEach((object) => object.enableEdit());
      }
    };

    $scope.discardChanges = () => {
      stopEditing();

      $scope.SeismoImageMap.metadataLayers
        .filter((layer) => layer.key !== "segments")
        .forEach((layer) => $scope.SeismoImageMap.resetLayer(layer));
    };

    $scope.exitEditing = () => {
      stopEditing();
      $scope.editing = false;
    };

    $scope.saveChanges = () => {
      $scope.SeismoImageMap.metadataLayers
        .filter((layer) => layer.key !== "intersections")
        .forEach((layer) => {
          var geoJson = JSON.stringify(layer.leafletLayer.toGeoJSON());
          console.log("geoJson for", layer.key, geoJson.substring(0, 100));
        });
    };

    $scope.showImageMap = () => {
      $scope.imageMapVisible = true;
    };

    $scope.hideImageMap = () => {
      $scope.imageMapVisible = false;
    };

    $scope.queryStationStatuses = () => {
      Loading.start("Loading results...");
      SeismoQuery.queryFiles($scope.queryParamModel).then((res) => {
        console.log("Query complete.", res.data);
        SeismoData.files = res.data.files;
        SeismoData.stationStatuses = res.data.stations;
        SeismoStationMap.updateBounds();
        PieOverlay.renderStatuses();
        Loading.stop();
      });
    };
  }

  init($scope, SeismoServer) {
    this.initQueryParams($scope);

    $scope.$http({url: SeismoServer.stationsUrl})
      .then((ret) => {
        // stations are loaded; render them
        $scope.SeismoData.stations = ret.data;
        $scope.PieOverlay.renderStations();
        // perform initial query
        $scope.queryStationStatuses();
      });
  }

  initQueryParams($scope) {

    // eventually dateFrom and dateTo should
    // come from the bounds in a query

    $scope.queryParamModel = {
      dateFrom: new Date("1937-10-14T19:26:00Z"),
      dateTo: new Date("1978-09-16T21:20:00Z"),
      stationNames: "",
      notStarted: true,
      inProgress: true,
      needsAttention: true,
      complete: true,
      editedByMe: false
    };
  }

}

export { SeismoMain };
