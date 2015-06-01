var fs = require("fs");

function validDateTime(dateString, timeString) {
  if (!dateString || !timeString || dateString.length !== 6 || timeString.length !== 4)
    return null;
  try {
    var month = dateString.substr(0, 2);
    var day = dateString.substr(2, 2);
    // enforce 20th century
    var year = "19" + dateString.substr(4, 2);
    if (year === "1937") {
      year = "1977";
    }
    if (year === "1954") {
      year = "1974";
    }
    var hour = timeString.substr(0, 2);
    var minute = timeString.substr(2, 2);
    var dt = month + "-" + day + "-" + year + " " + hour + ":" + minute + " GMT+0000";
    var parsed = Date.parse(dt);
    if (isNaN(parsed))
      return null;
    return new Date(parsed);
  } catch(e) {
    return null;
  }
}

function validStationId(stationId, stations, invalidStations) {
  if (!stationId) return null;
  // I figured these translation out by checking manually and observing
  // that the enclosing folder would say "0053", for example, and some
  // of the images inside the folder would be labeled "0753"
  if (stationId === "0753") return "0053";
  if (stationId === "0755") return "0055";
  if (stationId === "x108") return "0108";
  if (stationId === "xx53") return "0053";
  if (stationId === "0731") return "0031";
  while (stationId.length < 4) {
    stationId = "0" + stationId;
  }
  var found = stations.filter(function(s) { return s.stationId === stationId; });
  if (found.length === 0) {
    invalidStations[stationId] = invalidStations[stationId] || 1;
    invalidStations[stationId] ++;
    return null;
  }
  return stationId;
}

function validType(type, invalidTypes) {
  if (!type)
    return null;
  if (type.length === 1)
    type = "0" + type;
  if (type.length > 2) {
    var typeList = type.split("");
    while (typeList.length > 2)
      typeList.pop();
    type = typeList.join("");
  }
  if (type.length === 2 && parseInt(type) > 0 && parseInt(type) <= 6) {
    return type;
  } else {
    invalidTypes[type] = invalidTypes[type] || 1;
    invalidTypes[type] ++;
    return null;
  }
}

module.exports = {
  parse: function(fileName) {
    var text = fs.readFileSync(fileName).toString();
    //var stations = JSON.parse(fs.readFileSync("stations.json").toString());
    var seismos = [];
    var invalidTypes = {};
    text.split("\n").forEach(function(fileName) {
      if (!fileName || fileName.length === 0) return;
      //var parts = line.split("/");
      //var fileName = parts[parts.length - 1];
      var fileNameWithExt = fileName.split(".");
      console.assert(fileNameWithExt[1] === "png", fileNameWithExt[1], fileName);
      var dataParts = fileNameWithExt[0].split("_");
      var dateTime = validDateTime(dataParts[0], dataParts[1]);
      var stationId = dataParts[2];
      var type = validType(dataParts[3], invalidTypes);
      if (dateTime && type) {
        seismos.push({
          date: {"$date": dateTime.getTime()},
          stationId: stationId,
          type: type,
          name: fileName,
          status: 0
        });
      }
    });
    console.error("Invalid types:");
    for (var k in invalidTypes) {
      console.error("  ", k, invalidTypes[k]);
    }
    return seismos;
  },
  filterBadStations: function(seismos, stations) {
    var invalidStations = {};
    seismos = seismos.filter(function(seismo) {
      return null !== validStationId(seismo.stationId, stations, invalidStations);
    });
    seismos.forEach(function(seismo) {
      var stationId = validStationId(seismo.stationId, stations, invalidStations);
      console.assert(stationId !== null, "Internal Error.");
      seismo.stationId = stationId;
    });
    console.error("Invalid stations:");
    for (var k in invalidStations) {
      console.error("  ", k, invalidStations[k]);
    }
    return seismos;
  }
};
