class MapLink {
  constructor($timeout) {
    return {
      link: (scope, element, attrs) => {
        var mapService = scope[attrs.mapLink];
        mapService.init(attrs.id);

        if (attrs.mapLink === "SeismoImageMap") {
          scope.$watch("editing", (val, oldVal) => {
            // invalidate size when going in and out of editing mode
            if (val !== oldVal) {
              $timeout(() => mapService.leafletMap.invalidateSize());
            }
          });

          scope.$watch("imageMapVisible", (val, oldVal) => {
            // invalidate size when the image map becomes visible
            if (val && !oldVal) {
              $timeout(() => mapService.leafletMap.invalidateSize());
            }
          });
        } else {
          scope.$watch("imageMapVisible", (val, oldVal) => {
            // invalidate size when the pies map becomes visible
            if (!val && oldVal) {
              $timeout(() => mapService.leafletMap.invalidateSize());
            }
          });
        }
      }
    };
  }
}

export { MapLink };
