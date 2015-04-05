var L = window.L;

class SeismoImageMap {
  
  constructor() {
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
    
    leafletMap.setView(new L.LatLng(85,-180), 5);
  }

  loadImage(imagename) {
    var serverUrl = "http://localhost:3000";
    var url = serverUrl+"/tiles/"+imagename+"/{z}/{x}/{y}.png";

    // lazy initialization
    if (!this.imageLayer) {
      this.imageLayer = L.tileLayer(url, this.imageLayerOpts)
        .addTo(this.leafletMap);
      return;
    }

    this.imageLayer.setUrl(url);
  }

}

export { SeismoImageMap }
