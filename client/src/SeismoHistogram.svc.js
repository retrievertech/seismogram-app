class SeismoHistogram {
  
  constructor() {
  }

  init(id) {
    this.svgDomEl = document.getElementById(id);
    this.svgEl = d3.select("#"+id);
    
    this.resize();

    this.timeToXCoord = d3.time.scale.utc().range([0, this.width]);
    this.idxToXCoord = d3.scale.linear().range([0, this.width])
    this.yScale = d3.scale.linear().range([this.height, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.timeToXCoord)
      .orient("top");

    this.xAxisEl = this.svgEl.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")");
  }

  resize() {
    this.width = this.svgDomEl.parentElement.offsetWidth;
    this.height = 200;

    this.svgEl
      .attr("width", this.width)
      .attr("height", this.height);
  }

  setScale(lowDate, highDate, numBins) {
    this.timeToXCoord.domain([lowDate, highDate]);
    this.barWidth = Math.floor(this.width / numBins);
    this.idxToXCoord.domain([0, numBins]);
  }

  render(data) {
    this.yScale.domain([0, d3.max(data)]);

    var barGroups = this.svgEl.selectAll(".bar").data(data);

    // enter
    var bars = barGroups.enter().append("g")
      .attr("class", "bar");

    bars.append("rect")
      .attr("x", 1)
      .attr("width", this.barWidth - 1);

    // update
    barGroups.attr("transform", (d,i) => "translate(" + this.idxToXCoord(i) + "," + this.yScale(d) + ")");
    barGroups.selectAll("rect").attr("height", (d) => this.height - this.yScale(d));

    // exit
    barGroups.exit().remove();

    // axis
    this.xAxisEl.call(this.xAxis);
  }

}

export { SeismoHistogram };
