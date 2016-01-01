import {BasicChart} from './basic-chart';

var topojson = require('topojson');
require('./index.css');

export class GeoDemo extends BasicChart {
  constructor(){
    super();

    let chart = this.chart;

    let projection = d3.geo.equirectangular()
    .center([8, 56])
    .scale(150);

    let p1 = new Promise((resolve, reject) => {
      d3.json('data/water.json', (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });

    let p2 = new Promise((resolve, reject) => {
      d3.json('data/land.json', (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });

    let p3 = new Promise((resolve, reject) => {
      d3.json('data/cultural.json', (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });

    let p4 = new Promise((resolve, reject) => {
      d3.text('data/airports.dat', (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });

    let p5 = new Promise((resolve, reject) => {
      d3.csv('data/renditions.csv', (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });

    Promise.all([p1, p2, p3, p4, p5]).then((values) => {
      let [sea, land, cultural, airports, renditions] = values;

      draw(sea, land, cultural);
      addRenditions(airports, renditions);
    });

    function zoomable() {
      // Slow way
      // chart.call(d3.behavior.zoom()
      //   .translate(projection.translate())
      //   .scale(projection.scale())
      //   .on('zoom', () => onzoom()));

      // Fast way
      chart.call(d3.behavior.zoom()
        .center([chart.attr('width') / 2, chart.attr('height') / 2])
        .scale(projection.scale())
        .on('zoom', () => onzoom()));
    }

    function onzoom() {
      // Slow way
      // projection
      //   .translate(d3.event.translate)
      //   .scale(d3.event.scale);
      //
      // d3.selectAll('path')
      // .attr('d', d3.geo.path().projection(projection));
      //
      // d3.selectAll('line.route')
      //   .attr('x1', (d) => projection([d.from.lon, d.from.lat])[0])
      //   .attr('y1', (d) => projection([d.from.lon, d.from.lat])[1])
      //   .attr('x2', (d) => projection([d.to.lon, d.to.lat])[0])
      //   .attr('y2', (d) => projection([d.to.lon, d.to.lat])[1]);

      // Fast way
      let scaleFactor = d3.event.scale / projection.scale();
      chart.attr('transform', `translate(${d3.event.translate}) scale(${scaleFactor})`);
      d3.selectAll('line.route').each(function() {
        d3.select(this).style('stroke-width', `${ 2 / scaleFactor}px`);
      });
    }

    function addToMap(collection, key) {
      return chart.append('g')
      .selectAll('path')
      .data(topojson.feature(collection, collection.objects[key]).features)
      .enter()
      .append('path')
      .attr('d', d3.geo.path().projection(projection));
    }

    function draw (sea, land, cultural) {
      addToMap(sea, 'ne_50m_ocean')
      .classed('ocean', true);
      addToMap(land, 'ne_50m_land')
      .classed('land', true);
      // addToMap(sea, 'ne_50m_rivers_lake_centerlines')
      // .classed('river', true);
      addToMap(cultural, 'ne_50m_admin_0_boundary_lines_land')
      .classed('boundary', true);
      // addToMap(cultural, 'ne_10m_urban_areas')
      // .classed('urban', true);

      zoomable();
    }

    function addRenditions(_airports, renditions) {
      let airports = {},
        routes;

      d3.csv.parseRows(_airports).forEach(function (airport) {
        var id = airport[4];
        airports[id] = {
          lat: airport[6],
          lon: airport[7]
        };
      });

      routes = renditions.map((v) => {
        let dep = v['Departure Airport'];
        let arr = v['Arrival Airport'];
        return {
          from: airports[dep],
          to: airports[arr]
        };
      }).filter((v) => v.to && v.from).slice(0, 100);

      let lines = chart.selectAll('.route')
        .data(routes)
        .enter()
        .append('line')
        .attr('x1', (d) => projection([d.from.lon, d.from.lat])[0])
        .attr('y1', (d) => projection([d.from.lon, d.from.lat])[1])
        .attr('x2', (d) => projection([d.to.lon, d.to.lat])[0])
        .attr('y2', (d) => projection([d.to.lon, d.to.lat])[1])
        .classed('route', true);
    }
  }
}

export class ScalesDemo extends BasicChart {
  constructor() {
    super();
    // this.ordinal();
    this.quantitative();
  }

  ordinal() {
    let data = d3.range(30),
    colors = d3.scale.category10(),
    points = d3.scale.ordinal().domain(data)
    .rangePoints([0, this.height], 1.0),
    bands = d3.scale.ordinal().domain(data)
    .rangeBands([0, this.width], 0.1);

    this.chart.selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr({d: d3.svg.symbol().type('circle').size(10),
    transform: (d) => `translate(${(this.width / 2)}, ${points(d)})`
  })
  .style('fill', (d) => colors(d));

  this.chart.selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr({x: (d) => bands(d),
    y: this.height / 2,
    width: bands.rangeBand(),
    height: 10})
    .style('fill', (d) => colors(d));
  }

  quantitative() {
    let weierstrass = (x) => {
      let a = 0.5,
      b = (1+3*Math.PI/2) / a;
      return d3.sum(d3.range(100).map((n) => {
        return Math.pow(a, n)*Math.cos(Math.pow(b, n)*Math.PI*x);
      }));
    };

    let drawSingle = (line) => {
      return this.chart.append('path')
      .datum(data)
      .attr('d', line)
      .style({'stroke-width': 2,
      fill: 'none'});
    };

    let data = d3.range(-100, 100).map((d) => d / 200),
    extent = d3.extent(data.map(weierstrass)),
    colors = d3.scale.category10(),
    x = d3.scale.linear().domain(d3.extent(data)).range([0, this.width]);

    let linear = d3.scale.linear().domain(extent).range([this.height/4, 0]),
    line1 = d3.svg.line()
    .x(x)
    .y((d) => linear(weierstrass(d)));


    drawSingle(line1)
    .attr('transform', `translate(0, ${this.height / 16})`)
    .style('stroke', colors(0));

    let identity = d3.scale.identity().domain(extent),
    line2 = line1.y((d) => identity(weierstrass(d)));

    drawSingle(line2)
    .attr('transform', `translate(0, ${this.height / 12})`)
    .style('stroke', colors(1));

    let power = d3.scale.pow().exponent(0.2).domain(extent).range([ this.height / 2, 0]),
    line3 = line1.y((d) => power(weierstrass(d)));

    drawSingle(line3)
    .attr('transform', `translate(0, ${this.height / 8})`)
    .style('stroke', colors(2));

    var log = d3.scale.log().domain(
      d3.extent(data.filter((d) => d > 0 ? d : 0)))
      .range([0, this.width]),
      line4 = line1.x((d) => d > 0 ? log(d) : 0)
      .y((d) => linear(weierstrass(d)));

      drawSingle(line4)
      .attr('transform', `translate(0, ${this.height / 4})`)
      .style('stroke', colors(3));


      let quantize = d3.scale.quantize().domain(extent)
      .range(d3.range(-1, 2, 0.5).map((d) => d*100)),
      line5 = line1.x(x).y((d) => quantize(weierstrass(d))),
      offset = 100

      drawSingle(line5)
      .attr('transform', `translate(0, ${this.height / 2 + offset})`)
      .style('stroke', colors(4));

      var threshold = d3.scale.threshold().domain([-1, 0, 1]).range([-50, 0,50, 100]),
      line6 = line1.x(x).y((d) => threshold(weierstrass(d)));

      drawSingle(line6)
      .attr('transform', `translate(0, ${this.height / 2 + offset * 2})`)
      .style('stroke', colors(5));
    }
  }




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

      let scale = 8;
      let regions = d3.nest()
      .key((d) => Math.floor(d['x'] / scale))
      .key((d) => Math.floor(d['y'] / scale))
      .rollup((d) => d.length)
      .map(sequence);

      let values = d3.merge(d3.keys(regions).map((_x) => d3.values(regions[_x])));
      let median = d3.median(values),
      extent = d3.extent(values),
      shades = (extent[1] - extent[0]) / 2;

      d3.keys(regions).forEach((_x) => {
        d3.keys(regions[_x]).forEach((_y) => {
          let color,
          red = '#e23c22',
          green = '#497c36';

          if (regions[_x][_y] > median) {
            color = d3.rgb(green).brighter(regions[_x][_y] / shades);
          } else {
            color = d3.rgb(red).darker(regions[_x][_y] / shades);
          }
          this.chart.append('rect')
          .attr({
            x : x(_x, l * scale),
            y : y(_y, l * scale),
            width : l * scale,
            height : l * scale
          })
          .style({fill : color, 'fill-opacity' : 0.9});
        });
      });
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
