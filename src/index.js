var d3 = require('d3'); // Require

export class basicBarChart {
  constructor(data) {
    this.data = data;
    let svg = this.svg = d3.select('svg');
    let margin = {
      left: 10,
      top: 10,
      right: 10,
      bottom: 10
    };

    svg.attr('width', window.innerWidth);
    svg.attr('height', window.innerHeight);
    let chart = svg.append('g')
                   .attr('width', window.innerWidth - margin.left - margin.right)
  }
}


new basicBarChart([]);
