// 
// Turns stations.csv and files.uniq.txt into json files ready for
// import into mongo
// 

var stationsModule = require("./stations");
var filesModule = require("./files");
//var statusesModule = require("./statuses");
var fs = require("fs");
var path = require("path");

stationsModule.parse("data/stations.csv", function(stations) {
  var files = filesModule.parse("data/files.uniq.txt");
  files = filesModule.filterBadStations(files, stations);
  stationsModule.populateSeismoData(stations, files);
  console.error("Stations with zero files:");
  stations = stations.filter(function(station) {
    if (station.numFiles === 0)
      console.error("  ", station.code, station.location);
    return station.numFiles > 0;
  });
  fs.writeFileSync(path.join(__dirname, "files.json"), JSON.stringify(files, null, 2));
  fs.writeFileSync(path.join(__dirname, "stations.json"), JSON.stringify(stations, null, 2));
  //fs.writeFileSync(path.join(__dirname, "statuses.json"), JSON.stringify(statuses, null, 2));
  console.log("Wrote output to files.json, stations.json.");
});
