let d3 = require('d3');
let _ = require('lodash');

import {BasicChart} from './basic-chart';

export class UlamSpiral extends BasicChart {
  constructor(data) {
    super(data);  // Run the constructor in BasicChart, attaching chart to `this.chart`

    var dot = d3.svg.symbol().type('circle').size(3),
        center = 400, x = function(x, l) { return center + l * x; },
        y = function(y, l) { return center + l * y; };

    d3.text('data/primes-to-100k.txt', (data) => {
      let primes = data.split('\n').slice(0, 5000).map(Number);
      let sequence = this.generateSpiral(d3.max(primes))
                     .filter(function(d) {
                       return _.indexOf(primes, d['n'], true) > -1;
                     });

      var l = 2;

      this.chart.selectAll('path')
          .data(sequence)
          .enter()
          .append('path')
          .attr('transform',
                d => `translate(${ x(d['x'], l) }, ${ y(d['y'], l) })`)
          .attr('d', dot);
    });
  }

  // Private method
  generateSpiral(n) {
    let spiral = [];

    function* Ulam() {
      let x = 0,
        y = 0,
        min = [ 0, 0 ],
        max = [ 0, 0 ],
        add = [ 0, 0 ],
        i = 0,
        direction = 0,
        directions = {
          up : [ 0, -1 ],
          left : [ -1, 0 ],
          down : [ 0, 1 ],
          right : [ 1, 0 ]
        };

      while (true) {
        yield {x : x, y : y, n : i};

        add = directions[[ 'up', 'left', 'down', 'right' ][direction]];
        x += add[0], y += add[1];

        if (x < min[0]) {
          direction = (direction + 1) % 4;
          min[0] = x;
        }
        if (x > max[0]) {
          direction = (direction + 1) % 4;
          max[0] = x;
        }
        if (y < min[1]) {
          direction = (direction + 1) % 4;
          min[1] = y;
        }
        if (y > max[1]) {
          direction = (direction + 1) % 4;
          max[1] = y;
        }

        i++;
      }
    }

    var seq = new Ulam();
    for (let i = 0; i <= n; i++) {
      spiral.push(seq.next().value);
    }

    return spiral;
  }
}
