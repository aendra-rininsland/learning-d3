import TableBuilder from './table-builder';
import {BasicChart} from './basic-chart';

let d3 = require('d3');

export default function() {
  let chart = new BasicChart();
  let svg = chart.chart;

  let rings = 15;
  let colors = d3.scale.category20b();
  let angle = d3.scale.linear().domain([0, 20]).range([0, 2*Math.PI]);

  let arc = d3.svg.arc()
    .innerRadius((d) => d*50/rings)
    .outerRadius((d) => 50+d*50/rings)
    .startAngle((d, i, j) => angle(j))
    .endAngle((d, i, j) => angle(j+1));

  let shade = {
    darker: (d, j) => d3.rgb(colors(j)).darker(d/rings),
    brighter: (d, j) => d3.rgb(colors(j)).brighter(d/rings)
  };

  [
    [100, 100, shade.darker],
    [300, 100, shade.brighter]
  ].forEach(function (conf) {
    svg.append('g')
    .attr('transform', `translate(${conf[0]}, ${conf[1]})`)
    .selectAll('g')
    .data(colors.range())
    .enter()
    .append('g')
    .selectAll('path')
    .data((d) => d3.range(0, rings))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', (d, i, j) => conf[2](d, j));
  });

}

export function axisDemo(){
  let chart = new BasicChart();
  let svg = chart.chart;
  require('./index.css');

  let x = d3.scale.linear()
    .domain([0, 100])
    .range([chart.margin.left, chart.width - chart.margin.right]);


  let axis = d3.svg.axis()
    .scale(x);

  let axes = [
    d3.svg.axis().scale(x),
    d3.svg.axis().scale(x).ticks(5),
    d3.svg.axis().scale(x).tickSubdivide(3).tickSize(10, 5, 10),
    d3.svg.axis().scale(x).tickValues([0, 20, 50, 70, 100])
      .tickFormat((d, i) => ['a', 'e', 'i', 'o', 'u'][i]).orient('top')
  ];

  axes.forEach(function (axis, i) {
    let a = svg.append('g')
    .classed('axis', true)
    .classed('red', i%2 == 0)
    .attr('transform', `translate(0, ${i*50+(chart.margin.top)})`)
    .data(d3.range(0, 100))
    .call(axis);
  });
}

export function FunkyD3PathGenerators() {
  let chart = new BasicChart();
  let svg = chart.chart;

  let sine = d3.range(0, 10)
                 .map((k) => [0.5 * k * Math.PI, Math.sin(0.5 * k * Math.PI)]);

  let x =
      d3.scale.linear()
          .range(
              [0, chart.width / 2 - (chart.margin.left + chart.margin.right)])
          .domain(d3.extent(sine, (d) => d[0]));

  let y =
      d3.scale.linear()
          .range(
              [chart.height / 2 - (chart.margin.top + chart.margin.bottom), 0])
          .domain([-1, 1]);


  let line = d3.svg.line().x((d) => x(d[0])).y((d) => y(d[1]));

  let g = svg.append('g');

  g.append('path').datum(sine).attr('d', line).attr(
      {stroke: 'steelblue', 'stroke-width': 2, fill: 'none'});

  g.append('path')
      .datum(sine)
      .attr('d', line.interpolate('step-before'))
      .attr({stroke: 'black', 'stroke-width': 1, fill: 'none'});

  let g2 = svg.append('g')
    .attr('transform',
      'translate(' + (chart.width / 2 + (chart.margin.left + chart.margin.right)) +
      ', ' + chart.margin.top + ')');

  let area = d3.svg.area()
    .x((d) => x(d[0]))
    .y0(chart.height / 2)
    .y1((d) => y(d[1]))
    .interpolate('basis');

  g2.append('path')
    .datum(sine)
    .attr('d', area)
    .attr({fill: 'steelblue', 'fill-opacity': 0.4});

  g2.append('path')
    .datum(sine)
    .attr('d', line.interpolate('basis'))
    .attr({stroke: 'steelblue',
      'stroke-width': 2,
      fill: 'none'});

  let arc = d3.svg.arc();
  let g3 = svg.append('g')
    .attr('transform', 'translate(' +
      (chart.margin.left + chart.margin.right) +
      ',' +( chart.height / 2 + (chart.margin.top + chart.margin.bottom) ) +
    ')');

  g3.append('path')
    .attr('d', arc({outerRadius: 100,
      innerRadius: 50,
      startAngle: -Math.PI*0.25,
      endAngle: Math.PI*0.25}))
    .attr('transform', 'translate(150, 150)')
    .attr('fill', 'lightslategrey');

  let symbols = d3.svg.symbol()
    .type((d) => d[1] > 0 ? 'triangle-down' : 'triangle-up')
    .size((d, i) => i%2 ? 0 : 64);

  g2.selectAll('path')
    .data(sine)
    .enter()
    .append('path')
    .attr('d', symbols)
    .attr('transform', (d) => `translate(${x(d[0])},${y(d[1])})`)
    .attr({stroke: 'steelblue',
    'stroke-width': 2,
    fill: 'white'});

  g3.append('g')
  .selectAll('path')
  .data([{
    source: {
      radius: 50,
      startAngle: -Math.PI*0.30,
      endAngle: -Math.PI*0.20
    },
    target: {
      radius: 50,
      startAngle: Math.PI*0.30,
      endAngle: Math.PI*0.30}
    }])
    .enter()
    .append('path')
    .attr('d', d3.svg.chord());

  let data = d3.zip(d3.range(0, 12), d3.shuffle(d3.range(0, 12)));
  let colors = ['linen', 'lightsteelblue', 'lightcyan', 'lavender', 'honeydew', 'gainsboro'];

  let chord = d3.svg.chord()
    .source((d) => d[0])
    .target((d) => d[1])
    .radius(150)
    .startAngle((d) => -2*Math.PI*(1/data.length)*d)
    .endAngle((d) => -2*Math.PI*(1/data.length)*((d-1)%data.length));

  g3.append('g')
    .attr('transform', 'translate(300, 200)')
    .selectAll('path')
    .data(data)
    .enter()
    .append('path')
    .attr('d', chord)
    .attr('fill', (d, i) => colors[i%colors.length])
    .attr('stroke', (d, i) => colors[(i+1)%colors.length]);

  let g4 = svg.append('g')
    .attr('transform', `translate(${chart.width/2},${chart.height/2})`);

  let moustache = [
    {source: {x: 250, y: 100}, target: {x: 500, y: 90}},
    {source: {x: 500, y: 90}, target: {x: 250, y: 120}},
    {source: {x: 250, y: 120}, target: {x: 0, y: 90}},
    {source: {x: 0, y: 90}, target: {x: 250, y: 100}},
    {source: {x: 500, y: 90}, target: {x: 490, y: 80}},
    {source: {x: 0, y: 90}, target: {x: 10, y: 80}}
  ];

  g4.selectAll('path')
    .data(moustache)
    .enter()
    .append('path')
    .attr('d', d3.svg.diagonal())
    .attr({stroke: 'black', fill: 'none'});

}

export function myWeirdSVGDrawing() {
  let svg = new BasicChart().svg;

  svg.append('text')
      .text('A picture!')
      .attr({x: 10, y: 150, 'text-anchor': 'start'});

  svg.append('line').attr(
      {x1: 10, y1: 10, x2: 100, y2: 100, stroke: 'blue', 'stroke-width': 3});

  svg.append('rect').attr({x: 200, y: 50, width: 300, height: 400});

  svg.select('rect').attr(
      {stroke: 'green', 'stroke-width': 0.5, fill: 'white', rx: 20, ry: 40});

  svg.append('circle').attr({
    cx: 350,
    cy: 250,
    r: 100,
    fill: 'green', 'fill-opacity': 0.5,
    stroke: 'steelblue', 'stroke-width': 2
  });


  svg.append('ellipse').attr({
    cx: 350,
    cy: 250,
    rx: 150,
    ry: 70,
    fill: 'green', 'fill-opacity': 0.3,
    stroke: 'steelblue', 'stroke-width': 0.7
  });

  svg.append('ellipse').attr({cx: 350, cy: 250, rx: 20, ry: 70});

  svg.selectAll('ellipse, circle')
      .attr('transform',
            'translate(150, 0) scale(1.2) translate(-70, 0) rotate(-45, ' +
                (350 / 1.2) + ', ' + (250 / 1.2) + ') skewY(20)');

  svg.append('path').attr({
    d: 'M 100 100 L 300 100 L 200 300 z',
    stroke: 'black', 'stroke-width': 2,
    fill: 'red', 'fill-opacity': 0.7
  });
}

export function renderDailyShowGuestTable() {
  let url =
      'https://cdn.rawgit.com/fivethirtyeight/data/master/daily-show-guests/daily_show_guests.csv';

  let table = new TableBuilder(url);
}
