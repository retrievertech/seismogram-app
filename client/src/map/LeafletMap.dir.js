class LeafletMap {
  constructor(SeismoMap) {
    return {
      link: (scope, element, attrs) => {
        SeismoMap.init(attrs.id);
      }
    };
  }
}

export { LeafletMap };
