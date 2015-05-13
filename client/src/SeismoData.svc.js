var L = window.L;
var io = window.io;

class SeismoData {

  constructor($timeout, SeismoServer, SeismoImageMap) {
    this.files = [];
    this.stationStatuses = {};
    this.stations = [];

    io(SeismoServer.url).on("status-update", (obj) => {
      console.log("status-update", obj);
      this.files.forEach((file) => {
        if (file.name === obj.filename) {
          $timeout(() => {
            file.status = obj.status;
            if (file.status === 3 && file === SeismoImageMap.currentFile) {
              SeismoImageMap.loadImage(file);
            }
          });
        }
      });
    });
  }

  resultsBBox() {
    var stationIds = Object.keys(this.stationStatuses);

    // return max bounds if there are no results
    if (stationIds.length === 0) {
      return L.latLngBounds([-180, -90], [180, 90]);
    }

    // get the station points in the result set
    var points = stationIds.map((stationId) => {
      var station = this.stations.find((station) => station.stationId === stationId);
      return L.latLng(station.lat, station.lon);
    });

    // make a minimal bbox around the first point
    var minBBox = L.latLngBounds(points[0], points[0]);

    // extend the minimal bbox with every subsequent point
    return points.reduce((bbox, point) => bbox.extend(point), minBBox);
  }

  formatDate(file) {
    var pad = (val) => {
      val = val + "";
      return val.length === 1 ? "0" + val : val;
    };

    var date = new Date(file.date);
    var month = pad(date.getUTCMonth() + 1);
    var day = pad(date.getUTCDate());
    var year = date.getUTCFullYear();
    var hours = pad(date.getUTCHours());
    var minutes = pad(date.getUTCMinutes());

    return month + "/" + day + "/" + year + " " + hours + ":" + minutes;
  }

  stationLocation(file) {
    var station = this.stations.find((station) => station.stationId === file.stationId);
    return station.location;
  }

  seismoType(file) {
    var type = parseInt(file.type);

    if (type >= 1 && type <= 3) {
      return "Long-period";
    } else {
      return "Short-period";
    }
  }

  seismoDirection(file) {
    var type = parseInt(file.type);

    if (type === 1 || type === 4) {
      return "up-down";
    } else if (type === 2 || type === 5) {
      return "north-south";
    } else {
      return "east-west";
    }
  }

}

export { SeismoData };
