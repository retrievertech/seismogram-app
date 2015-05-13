class MapLink {
  constructor($timeout) {
    return {
      scope: {
        mapLink: '=', // call this object's init function when the directive links
        viewReset: '=' // whenever this object changes, invalidate map size
      },
      link: (scope, element, attrs) => {
        scope.mapLink.init(attrs.id);
        scope.$watch('viewReset', () => {
          $timeout(() => mapService.leafletMap.invalidateSize());
        });
      }
    }
  }
}

export { MapLink };
