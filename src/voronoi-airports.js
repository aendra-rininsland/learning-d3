let d3 = require('d3');

export default function(location){
  let svg = d3.select('body').append('svg');
  svg.attr('width', 960)
    .attr('height', 500);

  let topojson = require('topojson');
  let projection = d3.geo.mercator()
    .scale(250);

  let boundaries = require('earth-topojson/110m.json');
  let path = d3.geo.path()
    .projection(projection);

  svg.append('g').selectAll('path')
    .data(topojson.feature(boundaries, boundaries.objects.countries).features)
    .enter()
    .append('path')
    .attr('d', d3.geo.path().projection(projection));
}
