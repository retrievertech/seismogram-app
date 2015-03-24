class LeafletMap {
  constructor(map) {
    return {
      link: (scope, element, attrs) => {
        map.init(attrs.id);
      }
    }
  }
}

export { LeafletMap }