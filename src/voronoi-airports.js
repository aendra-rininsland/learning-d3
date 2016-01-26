let d3 = require('d3');
import {isInside} from './helpers';
import topojson from 'topojson';

export default class {
  name = String;

  constructor(location = String) {
    this.location = location.split(/,\s?/);
    let projection = d3.geo.equirectangular()
    .center([5, 56])
    .scale(250);

    let svg = this.svg = d3.select('div#chart').append('svg')
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight);

    let p = new Promise((resolve, reject) => {
      d3.text('data/airports.dat', (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });

    p.then((airportData) => {
      this.airports = [];

      let boundaries = require('earth-topojson/110m.json');

      this.airports = d3.csv.parseRows(airportData);


      let path = d3.geo.path()
          .projection(projection)
          .pointRadius(0.1);


      let voronoi = d3.geom.voronoi(this.airports.map((airport) => [airport[7], airport[6]]).map(projection)).filter((d, i) => {

        console.log(typeof d);
        if (typeof d !== 'undefined') {
          return d;
        }
      });
      svg.append("path")
          .datum(voronoi)
          .attr("class", "voronoi")
          .attr("d", (d, i) => { return "M" + d.map(function(d) { return d.join("L"); }).join("ZM") + "Z"; });

      voronoi.forEach((v, i) => {
        if (isInside(projection([this.location[1], this.location[0]]), v)) {
          console.log(v, i);
          console.log(this.airports[i]);
          console.log(projection([this.airports[i][7], this.airports[i][6]]));
          let airport = this.airports.filter((d) => /*console.log(v.point, Number(d[7]), Number(d[6]), projection([Number(d[7]), Number(d[6])])) &&*/ v.point === projection([Number(d[7]), Number(d[6])]));
          console.dir(airport);
          svg.append("path")
              .datum([v])
              .attr("class", "voronoi-here")
              .attr('fill' ,'green')
              .attr("d", (d, i) => { return "M" + d.map(function(d) { return d.join("L"); }).join("ZM") + "Z"; });

          // svg.append('circle').classed('here-voronoi', true).attr('fill', 'green').attr('cx', v.point[0]).attr('cy', v.point[1]).attr('r', 10);
        }
      });

      svg.append('path')
          .datum({type: 'MultiPoint', coordinates: this.airports.map((airport) => [airport[7], airport[6]])})
          .attr('class', 'points')
          .attr('d', path);

      let here = projection([this.location[1], this.location[0]]);

      svg.append('circle').classed('here', true).attr('fill', 'red').attr('cx', here[0]).attr('cy', here[1]).attr('r', 1);

      svg.append('g')
      .selectAll('path')
      .data(topojson.feature(boundaries, boundaries.objects.countries).features)
      .enter()
      .append('path')
      .classed('boundary', true)
      .attr('d', d3.geo.path().projection(projection));
      require('./index.css');
    });
  }
}
