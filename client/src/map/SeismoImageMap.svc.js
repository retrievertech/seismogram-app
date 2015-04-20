var L = window.L;

class SeismoImageMap {
  
  constructor($http, SeismoServer) {
    this.server = SeismoServer;
    this.http = $http;
    this.leafletMap = null;
    this.imageLayer = null;
    this.imageLayerOpts = {
      // tileSize: 512,
      noWrap: true,
      crossOrigin: true,
      continuousWorld: true
    };
  }

  init(id) {
    var leafletMap = this.leafletMap = L.map(id, {
      maxZoom: 5,
      minZoom: 0,
      crs: L.extend({}, L.CRS.EPSG3857, {
        wrapLat: null, wrapLng: null, infinite: true
      })
    });
    
    leafletMap.setView(new L.LatLng(74, -9.66), 2);
  }

  loadImage(imagename) {
    var url = this.server.tilesUrl + "/" + imagename + "/{z}/{x}/{y}.png";
    // lazy initialization
    if (!this.imageLayer) {
      this.imageLayer = L.tileLayer(url, this.imageLayerOpts)
        .addTo(this.leafletMap);
      return;
    }
    this.imageLayer.setUrl(url);
  }

}

export { SeismoImageMap };
