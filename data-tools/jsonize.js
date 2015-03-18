var stationsModule = require("./stations");
var filesModule = require("./files");
var fs = require("fs");
var path = require("path");

stationsModule.parse("data/stations.csv", function(stations) {
  var files = filesModule.parse("data/files.uniq.txt");
  files = filesModule.filterBadStations(files, stations);
  stationsModule.populateSeismoData(stations, files);
  fs.writeFileSync(path.join(__dirname, "files.json"), JSON.stringify(files, null, 2));
  fs.writeFileSync(path.join(__dirname, "stations.json"), JSON.stringify(stations, null, 2));
  console.log("Wrote output to files.json and stations.json");
});
