class MapLink {
  constructor() {
    return {
      link: (scope, element, attrs) => {
        var mapService = scope[attrs.mapLink];
        mapService.init(attrs.id);
      }
    };
  }
}

export { MapLink };
