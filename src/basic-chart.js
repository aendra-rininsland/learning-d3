export class BasicChart {
  constructor(data) {
    var d3 = require('d3'); // Require D3 via Webpack

    this.data = data;
    this.svg = d3.select('div#chart').append('svg');

    this.margin = {
      left: 20,
      top: 20,
      right: 20,
      bottom: 20
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
