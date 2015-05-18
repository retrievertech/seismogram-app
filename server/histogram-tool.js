var d3 = require("d3");

function HistogramTool(lowDate, highDate) {
  this.lowDate = lowDate;
  this.highDate = highDate;
}

HistogramTool.prototype.setNumBins = function(numBins) {
  this.numBins = numBins;
  this.binBoundaries = [];
  
  var timeScale = d3.time.scale.utc()
    .domain([this.lowDate, this.highDate])
    .range([0, numBins]);

  for (var i = 0; i < numBins+1; i++) {
    this.binBoundaries.push(timeScale.invert(i));
  }
}

HistogramTool.prototype.getBinIdx = function(date) {
  var boundaryIdx = d3.bisectLeft(this.binBoundaries, date);
  return boundaryIdx - 1;
}

module.exports = HistogramTool;
