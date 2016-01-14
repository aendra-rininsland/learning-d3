let d3 = require('d3');

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
