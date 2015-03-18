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
        callback(stations);
        //console.log(JSON.stringify(stations, null, 2));
      }
    });
  },
  populateSeismoData: function(stations, seismos) {
    stations.forEach(function(station) {
      seismos.forEach(function(seismo) {
        if (station.stationId === seismo.stationId) {
          station.numFiles++;
        }
      });
    });
  }
};
