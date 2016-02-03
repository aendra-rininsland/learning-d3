var d3 = require('d3');

export function uniques(data, name) {
  let uniques = [];
  data.forEach((d) => {
    if (uniques.indexOf(name(d)) < 0) {
      uniques.push(name(d));
    }
  });
  return uniques;
}

export function nameId(data, name) {
  let uniqueNames = uniques(data, name);
  return d3.scale.ordinal()
    .domain(uniqueNames)
    .range(d3.range(uniqueNames.length));
}

export function binPerName (data, name) {
  let nameIds = nameId(data, name);
  let histogram = d3.layout.histogram()
    .bins(nameIds.range())
    .value((d) => nameIds(name(d)));

  return histogram(data);
}

export const color = d3.scale.ordinal().range(['#EF3B39', '#FFCD05', '#69C9CA', '#666699', '#CC3366',
  '#0099CC', '#999999', '#FBF5A2', '#6FE4D0', '#CCCB31', '#009966', '#C1272D', '#F79420', '#445CA9',
  '#402312', '#272361', '#A67C52', '#016735', '#F1AAAF','#A0E6DA', '#C9A8E2', '#F190AC', '#7BD2EA',
  '#DBD6B6']);

export function fixateColors (data) {
  color.domain(uniques(data, (d) => d.DonorName));
}

export function arcLabels(text, radius) {
  return function (selection) {
    selection.append('text')
      .text(text)
      .attr('text-anchor', (d) => tickAngle(d) > 100 ? 'end' : 'start')
      .attr('transform', (d) => {
        let degrees = tickAngle(d);
        let turn = `rotate(${degrees}) translate(${radius(d) + 10}, 0)`;
        if (degrees > 100) {
          turn += `rotate(180)`;
        }
        return turn;
      });
  }
}

export function tickAngle (d) {
  let midAngle = (d.endAngle - d.startAngle) / 2;
  let degrees = (midAngle + d.startAngle) / Math.PI * 180 - 90;
  return degrees;
}

export function tooltip (text, chart) {
  return function (selection) {
    selection.on('mouseover.tooltip', mouseover)
      .on('mousemove.tooltip', mousemove)
      .on('mouseout.tooltip', mouseout);

    function mouseover(d) {
      let path = d3.select(this);
      path.classed('highlighted', true);

      let mouse = d3.mouse(chart.node());
      let tool = chart.append('g')
        .attr({
          'id': 'nameTooltip',
          transform: `translate(${mouse[0] + 5},${mouse[1] + 10})`
        });

      let textNode = tool.append('text')
        .text(text(d)).node();

      tool.append('rect')
        .attr({
          height: textNode.getBBox().height,
          width: textNode.getBBox().width,
          transform: 'translate(0, -16)'
        });

      tool.select('text')
        .remove();

      tool.append('text').text(text(d));
    }

    function mousemove () {
        let mouse = d3.mouse(chart.node());
        d3.select('#nameTooltip')
        .attr('transform', `translate(${mouse[0] + 15},${mouse[1] + 20})`);
    }

    function mouseout () {
        let path = d3.select(this);
        path.classed('highlighted', false);
        d3.select('#nameTooltip').remove();
    }
  }
}

export function connectionMatrix (data) {
  let nameIds = nameId(allUniqueNames(data), (d) => d );
  let uniques = nameIds.domain();
  let matrix = d3.range(uniques.length).map(() => d3.range(uniques.length).map(() =>  0));
  data.forEach((d) => {
    matrix[nameIds(d.DonorName)][nameIds(d.EntityName)] += Number(d.Value.replace(/[^\d\.]*/g, ''));
  });

  return matrix;
}

export function allUniqueNames(data) {
  let donors = uniques(data, (d) => d.DonorName);
  let donees = uniques(data, (d) => d.EntityName);
  return uniques(donors.concat(donees), (d) => d);
}

export function makeTree(data, filterByDonor, name1, name2) {
  let tree = {name: 'Donations', children: []};
  let uniqueNames = uniques(data, (d) => d.DonorName)

  tree.children = uniqueNames.map((name) => {
    let donatedTo = data.filter((d) => filterByDonor(d, name));
    let donationsValue = donatedTo.reduce((last, curr) => {
          let value = Number(curr.Value.replace(/[^\d\.]*/g, ''));
          return value ? last + value : last;
      }, 0);

    return {
      name: name,
      donated: donationsValue,
      children: donatedTo.map((d) => {
        return {
          name: name2(d),
          count: 0,
          children: []
        };
      })
    };
  });

  return tree;
}

/**
 * Returns whether a point is inside a polygon.
 * The following function is taken from https://github.com/substack/point-in-polygon/
 *
 * Based on a ray-casting algorithm from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 *
 * @param  {Array}                 point      An array with x and y coordinates of a point. Can also be lon/lat.
 * @param  {Array<Array<Number>>}  polygon    The polygon as an array of arrays containing x and y coordinates.
 * @return {Boolean}                          Whether the point is inside the polygon or not.
 */
export function isInside(point, polygon) {
  let x = Number(point[0]), y = Number(point[1]);

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i][0], yi = polygon[i][1];
      let xj = polygon[j][0], yj = polygon[j][1];

      let intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Find the nearest point using Voronoi geom
 * @param  {String}               location Comma-separated lat/lng string
 * @param  {Array<Array<Number>>} points   An array of arrays containing points
 * @return {Object|Void}                   The nearest point to location. Throws Error if point not found.
 */
export function nearestVoronoi(location, points, returnEquirectangular = true) {
  let nearest = {};
  let projection = d3.geo.equirectangular();

  location = location.split(/,\s?/);

  let voronoi = d3.geom.voronoi(
    points.map((point) => {
      let projected = returnEquirectangular ? projection([point.longitude, point.latitude]) : [point.longitude, point.latitude];
      return [projected[0], projected[1], point];
    }))
    .filter((d) => d);

  voronoi.forEach((region) => {
    if (isInside(returnEquirectangular ? projection([location[1], location[0]]) : [location[1], location[0]], region)) {
      nearest = {
        point: region.point[2],
        region: region
      };
    }
  });

  if (nearest === {}) throw new Error('Nearest not findable');
  else return nearest;
}
