class MapLink {
  constructor($timeout) {
    return {
      scope: {
        mapLink: "=", // call this object's init function when the directive links
        viewReset: "=" // whenever this object changes, invalidate map size
      },
      link: (scope, element, attrs) => {
        scope.mapLink.init(attrs.id);
        scope.$watch("viewReset", (val) => {
          console.log(val);
          $timeout(() => scope.mapLink.leafletMap.invalidateSize());
        });
      }
    };
  }
}

export { MapLink };
