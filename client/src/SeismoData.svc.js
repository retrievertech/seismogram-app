class SeismoData {

  constructor() {
    this.files = [];
    this.stations = [];
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

    if (type == 1 || type === 4) {
      return "up-down";
    } else if (type === 2 || type === 5) {
      return "north-south";
    } else {
      return "east-west";
    }
  }

}

export { SeismoData };
