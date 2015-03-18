var fs = require("fs");
var stations = JSON.parse(fs.readFileSync("stations.json").toString());

var woId = [];
var dups = {};
stations.forEach(function(s) {
  if (!s.stationId) woId.push(s);
  else {
    if (typeof dups[s.stationId] === "undefined") {
      dups[s.stationId] = 1;
    } else {
      dups[s.stationId]++;
    }
  }
});
console.log("== Missing ID: ==");
woId.forEach(function(s) {
  console.log(s.code, s.location);
});
console.log("== Repeated ID: ==");
for (var k in dups) {
  if (dups[k] > 1) {
    console.log(k, dups[k]);
  }
}
