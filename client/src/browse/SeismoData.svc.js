var L = window.L;
var io = window.io;

class SeismoData {

  constructor($timeout, SeismoServer, SeismoStatus, SeismoImageMap, SeismoEditor) {
    this.stationQueryData = [];
    this.filesQueryData = {};
    this.groups = [];
    this.gotDataAlready = false;

    io(SeismoServer.url).on("status-update", (obj) => {
      console.log("status-update", obj);
      this.files.forEach((file) => {
        if (file.name === obj.filename) {
          $timeout(() => {
            var oldStatus = file.status;
            file.status = obj.status;
            if ((SeismoStatus.is(file.status, "Complete") || SeismoStatus.is(file.status, "Edited")) &&
                file === SeismoImageMap.currentFile && oldStatus !== file.status)
            {
              SeismoEditor.stopEditing();
              SeismoImageMap.loadImage(file);
            }
          });
        }
      });
    });
  }

  // This method populates the "groups" prop.
  // Groups is the same as files except instead of an array, it is an array of arrays,
  // currently each sub-array being of size 2. For example,
  //   files == [a,b,c,d,e,f,g];
  //   groups == [[a,b], [c,d], [e,f], [g]]
  // This is used by the UI to display the seismograms list in rows of 2.
  // TODO: Is there an underscore function that does this?
  // TODO: Could this be done with a filter?

  setGroups(files) {
    this.groups = [];

    var group = [];

    files.forEach((file) => {
      if (group.length < 2) {
        group.push(file);
      }
      if (group.length === 2) {
        this.groups.push(group);
        group = [];
      }
    });

    if (group.length > 0) {
      this.groups.push(group);
    }
  }

  // holds on to the station data as returned by the server
  setStationQueryData(data) {
    this.stationQueryData = data;
  }

  // holds on to the files query data as returned by the server
  setFilesQueryData(data) {
    this.filesQueryData = data;
    this.setGroups(data.files);
    this.gotDataAlready = true;
  }

  resultsBBox() {
    var stationIds = Object.keys(this.filesQueryData.stations);

    // return max bounds if there are no results
    if (stationIds.length === 0) {
      return L.latLngBounds([-180, -90], [180, 90]);
    }

    // get the station points in the result set
    var points = stationIds.map((stationId) => {
      var station = this.stationQueryData.find((station) => station.stationId === stationId);
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
    return this.getStation(file.stationId).location;
  }

  getStation(id) {
    return this.stationQueryData.find((station) => station.stationId === id);
  }

  isLongPeriod(file) {
    var type = parseInt(file.type);
    return type >= 4 && type <= 6;
  }

  isShortPriod(file) {
    var type = parseInt(file.type);
    return type >= 1 && type <= 3;
  }

  seismoType(file) {
    if (this.isLongPeriod(file)) {
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
