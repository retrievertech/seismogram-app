class MapLink {
  constructor($timeout) {
    return {
      link: (scope, element, attrs) => {
        var mapService = scope[attrs.mapLink];
        mapService.init(attrs.id);

        if (attrs.mapLink === "SeismoImageMap") {
          scope.$watch("editing", (val, oldVal) => {
            if (val !== oldVal) {
              $timeout(() => mapService.leafletMap.invalidateSize());
            }
          });
        }
      }
    };
  }
}

export { MapLink };
