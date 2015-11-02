export class BasicChart {
  constructor(data) {
    var d3 = require('d3'); // Require D3 via Webpack

    this.data = data;
    this.svg = d3.select('div#chart').append('svg');

    this.margin = {
      left: 100,
      top: 50,
      right: 0,
      bottom: 0
    };

    this.svg.attr('width', window.innerWidth);
    this.svg.attr('height', window.innerHeight);

    this.width = window.innerWidth - this.margin.left - this.margin.right;
    this.height = window.innerHeight - this.margin.top - this.margin.bottom;

    this.chart = this.svg.append('g')
      .attr('width', this.width)
      .attr('height', this.height);
  }
}
