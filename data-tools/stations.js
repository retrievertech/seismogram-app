var fs = require("fs");
var csv = require("csv");
var headers = ["stationId", "code", "lat", "lon", "location", "usOrOther",
               "gsn", "spzSummer", "spzWinter", "lpzSummer", "lpzWinter"];

module.exports = {
  parse: function(fileName, callback) {
    var text = fs.readFileSync(fileName).toString();
    var stations = [];
    csv.generate({seed: 1, columns: headers.length});
    csv.parse(text, function(err, data) {
      if (err) {
        console.log(err);
      } else {
        data.forEach(function(line) {
          var obj = {};
          if (line[0].length > 0) {
            while (line[0].length < 4) {
              line[0] = "0" + line[0];
            }
          }
          for (var i = 0; i < headers.length; ++i) {
            obj[headers[i]] = line[i];
          }
          obj.spzSummer = parseFloat(obj.spzSummer);
          obj.spzWinter = parseFloat(obj.spzWinter);
          obj.lpzSummer = parseFloat(obj.lpzSummer);
          obj.lpzWinter = parseFloat(obj.lpzWinter);
          obj.lon = parseFloat(obj.lon);
          obj.lat = parseFloat(obj.lat);
          obj.numFiles = 0;
          stations.push(obj);
        });
        callback(this.filterInvalidStations(stations));
        //console.log(JSON.stringify(stations, null, 2));
      }
    }.bind(this));
  },
  populateSeismoData: function(stations, seismos) {
    stations.forEach(function(station) {
      seismos.forEach(function(seismo) {
        if (station.stationId === seismo.stationId) {
          station.numFiles++;
        }
      });
    });
  },
  filterInvalidStations: function(stations) {
    var woId = [];
    var dups = {};
    var woLatLon = [];
    stations.forEach(function(s) {
      if (!s.stationId) woId.push(s);
      else if (isNaN(s.lat) || isNaN(s.lon)) {
        woLatLon.push(s);
      } else {
        if (typeof dups[s.stationId] === "undefined") {
          dups[s.stationId] = 1;
        } else {
          dups[s.stationId]++;
        }
      }
    });
    // print errors
    console.error("Stations with missing ID:");
    woId.forEach(function(s) {
      console.log("  ", s.code, s.location);
    });
    console.error("Stations without lat/lon:");
    woLatLon.forEach(function(s) {
      console.log("  ", s.code, s.location);
    });
    console.log("Stations with repeated ID:");
    for (var k in dups) {
      if (dups[k] > 1) {
        console.log("  ", k, dups[k]);
      }
    }
    // return filtered results
    stations = stations.filter(function(station) {
      return station.stationId && dups[station.stationId] === 1 && !isNaN(station.lat) && !isNaN(station.lon);
    });
    return stations;
  }
};
