class MapLink {
  constructor($timeout) {
    console.log("maplink here");
    return {
      scope: {
        mapLink: "=", // call this object's init function when the directive links
        viewReset: "=" // whenever this object changes, invalidate map size
      },
      link: (scope, element, attrs) => {
        console.log("maplink", attrs.id, scope);
        scope.mapLink.init(attrs.id);
        scope.$watch("viewReset", (oldVal, newVal) => {
          if (typeof newVal !== "undefined") {
            $timeout(() => scope.mapLink.leafletMap.invalidateSize());
          }
        });
      }
    };
  }
}

export { MapLink };
