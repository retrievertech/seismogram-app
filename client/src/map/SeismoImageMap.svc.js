var L = window.L;

class SeismoImageMap {
  
  constructor() {
    this.leafletMap = null;
  }

  init(id) {
    var leafletMap = this.leafletMap = L.map(id, {
      maxZoom: 5,
      minZoom: 0,
      crs: L.extend({}, L.CRS.EPSG3857, {
        wrapLat: null, wrapLng: null, infinite: true
      })
    });
    
    leafletMap.setView(new L.LatLng(85,-180), 5);
  }

}

export { SeismoImageMap }
