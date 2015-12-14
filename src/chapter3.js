let d3 = require('d3');
let _ = require('lodash');

import {BasicChart} from './basic-chart';

export class UlamSpiral extends BasicChart {
  constructor(data) {
    super(data); // Run the constructor in BasicChart, attaching chart to
                 // `this.chart`

    let dot = d3.svg.symbol().type('circle').size(3),
      center = 400,
      l = 2,
      x = (x, l) => center + l * x,
      y = (y, l) => center + l * y;


      let primes = this.generatePrimes(2000);

      let sequence = this.generateSpiral(d3.max(primes))
                         .filter(function(d) {
                           return primes.indexOf(d['n']) > -1;
                         });

      this.chart.selectAll('path')
          .data(sequence)
          .enter()
          .append('path')
          .attr('transform',
                d => `translate(${ x(d['x'], l) }, ${ y(d['y'], l) })`)
          .attr('d', dot);

  }

  generateSpiral(n) {
    let spiral = [],
      x = 0, y = 0,
      min = [0, 0],
      max = [0, 0],
      add = [0, 0],
      direction = 0,
      directions = {
        up : [ 0, -1 ],
        left : [ -1, 0 ],
        down : [ 0, 1 ],
        right : [ 1, 0 ]
      };

    d3.range(1, n).forEach((i) => {
      spiral.push({x : x, y : y, n : i});
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
    });

    return spiral;
  }

  generatePrimes(n) {
    function* getPrimes(count, seq) {
      while (count) {
        yield seq.next().value;
        count--;
      }
    }

    function* primes() {
      let seq = numbers(2); // Start on 2.
      let prime;

      while (true) {
        prime = seq.next().value;
        yield prime;
        seq = filter(seq, prime)
      }
    }

    function* numbers(start) {
      while (true) {
        yield start++;
      }
    }

    function* filter(seq, prime) {
      for (let num of seq) {
        if (num % prime !== 0) {
          yield num;
        }
      }
    }

    let results = [];
    for (let prime of getPrimes(n, primes())) {
      results.push(prime);
    }

    return results;
  }
}
