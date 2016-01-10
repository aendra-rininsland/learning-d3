import * as helpers from './helpers';
import {BasicChart} from './basic-chart';
let d3 = require('d3');

export default class PoliticalDonorChart extends BasicChart {
  constructor(chartType, ...args) {
    super();

    let p = new Promise((res, rej) => {
      d3.csv('data/uk_political_donors.csv', (err, data) => err ? rej(err) : res(data));
    });


    p.then((data) => {
      this.data = data;
      this[chartType].call(this, ...args);
    });
  }

  histogram() {
    let data = this.data.filter((d) => d.EntityName.match(' MP'));
    let nameId = helpers.nameId(data, (d) => d.EntityName);
    let histogram = d3.layout.histogram()
                        .bins(nameId.range())
                        .value((d) => nameId(d.EntityName))(data);

    this.margin = {top : 10, right : 40, bottom : 100, left : 50};

    let x = d3.scale.linear()
      .domain([0, d3.max(histogram, (d) => d.x)])
      .range([this.margin.left, this.width-this.margin.right]);

    let y = d3.scale.log().domain([1, d3.max(histogram, (d) => d.y)])
      .range([ this.height - this.margin.bottom, this.margin.top ]);

    let yAxis = d3.svg.axis()
         .scale(y)
         .tickFormat(d3.format('f'))
         .orient('left');

    this.chart.append('g')
     .classed('axis', true)
     .attr('transform', 'translate(50, 0)')
     .call(yAxis);

    let bar = this.chart.selectAll('.bar')
               .data(histogram)
               .enter()
               .append('g')
               .classed('bar', true)
               .attr('transform', (d) => `translate(${x(d.x)},${y(d.y)})`);

    bar.append('rect')
      .attr({
        x: 1,
        width: x(histogram[0].dx) - this.margin.left - 1,
        height: (d) => this.height - this.margin.bottom - y(d.y) 
      });


    bar.append('text')
      .text((d) => d[0].EntityName)
      .attr({
        transform: (d) => `translate(0, ${this.height - this.margin.bottom - y(d.y) + 7}) rotate(60)`
      });

    require('./chapter5.css');
  }

  pie(name) {
    let data = this.data;
    let filtered = data.filter((d) => d.EntityName === name);
    let perDonor = helpers.binPerName(filtered, (d) => d.DonorName);
    let pie = d3.layout.pie()
      .value((d) => d.length)(perDonor);

    let arc = d3.svg.arc()
      .outerRadius(150)
      .startAngle((d) => d.startAngle)
      .endAngle((d) => d.endAngle);

    helpers.fixateColors(data);

    let slice = this.chart.selectAll('.slice')
               .data(pie)
               .enter()
               .append('g')
               .attr('transform', 'translate(300, 300)');

    slice.append('path')
      .attr({
        d: arc,
        fill: (d) => helpers.color(d.data[0].DonorName)
      });

    slice.call(helpers.arcLabels((d) => `${d.data[0].DonorName} (${d.value})`, arc.outerRadius()));
  }

  streamgraph() {
    let time = d3.time.format('%d/%m/%y');
    let data = this.data;
    let extent = d3.extent(data.map((d) => time.parse(d.ReceivedDate)));
    let timeBins = d3.time.days(extent[0], extent[1], 12);

    let perName = helpers.binPerName(data, (d) => d.EntityName);
    let timeBinned  = perName.map((nameLayer) => {
      return {
        to: nameLayer[0].EntityName,
        values: d3.layout.histogram()
              .bins(timeBins)
              .value((d) => time.parse(d.ReceivedDate))(nameLayer)
      }
    });

    let layers = d3.layout.stack()
      .order('inside-out')
      .offset('wiggle')
      .values((d) => d.values)(timeBinned);

    this.margin = {
      top: 220,
      right: 50,
      bottom: 0,
      left: 50
    };

    let x = d3.time.scale()
      .domain(extent)
      .range([this.margin.left, this.width - this.margin.right]);

    let y = d3.scale.linear()
      .domain([0, d3.max(layers, (layer) => d3.max(layer.values, (d) => d.y0 + d.y))])
      .range([this.height - this.margin.top, 0]);

    let offset = 100;
    let area = d3.svg.area()
      .x((d) => x(d.x))
      .y0((d) => y(d.y0) + offset)
      .y1((d) => y(d.y0 + d.y) + offset);

    let xAxis = d3.svg.axis()
      .scale(x)
      .tickFormat(d3.time.format('%b %Y'))
      .ticks(d3.time.months, 2)
      .orient('bottom');

    this.chart.append('g')
      .attr('transform', `translate(0, ${this.height - 100})`)
      .classed('axis', true)
      .call(xAxis)
      .selectAll('text')
        .attr('y', 5)
        .attr('x', 9)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(60)')
        .style('text-anchor', 'start');

    this.chart.selectAll('path')
      .data(layers)
      .enter()
      .append('path')
      .attr('d', (d) => area(d.values))
      .style('fill', (d, i) => helpers.color(i))
      .call(helpers.tooltip((d) => d.to, this.chart));

    require('./chapter5.css');
  }

  chord(filterString, mpWidth) {
    let data = this.data;
    let filtered = data.filter((d) => d.EntityName.match(filterString || ' MP') );
    let uniqueMPs = helpers.uniques(filtered, (d) => d.EntityName);
    uniqueMPs.forEach((v) => {
      filtered.push({
        DonorName: v,
        EntityName: v,
        Value: '9001'
      });
    });

    let uniques = helpers.uniques(filtered, (d) => d.DonorName);
    let matrix = helpers.connectionMatrix(filtered);
    let innerRadius = Math.min(this.width, this.height) * 0.3;
    let outerRadius = innerRadius * 1.1;

    let chord = d3.layout.chord()
      .padding(.05)
      .sortGroups(d3.descending)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending)
      .matrix(matrix);

    let diagram = this.chart.append('g')
      .attr('transform', `translate(${this.width / 2},${this.height / 2})`);

    let group = diagram.selectAll('.group')
      .data(chord.groups)
        .enter().append('g');

    let arc = d3.svg.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    group.append('path')
      .attr('d', arc)
      .attr('fill', (d) => helpers.color(d.index));

    group.call(helpers.arcLabels((d) => uniques[d.index], () => outerRadius+10));

    diagram.append('g')
           .classed('chord', true)
           .selectAll('path')
           .data(chord.chords)
           .enter()
           .append('path')
           .attr('d', d3.svg.chord().radius(innerRadius))
           .attr('fill', (d) => helpers.color(d.target.index));

    this.chart.selectAll('text').filter(function(d) { return d3.select(this).text().match(filterString)})
      .style('font-weight', 'bold');
  }

  force() {
    let data = this.data;
    let nameId = helpers.nameId(data, (d) => d.EntityName);
    let uniques = nameId.domain();
    let matrix = helpers.connectionMatrix(data); 

    let nodes = uniques.map((name) => { return {name: name}; });
    let links = data.map((d) => {
      return {
        source: nameId(d.DonorName),
        target: nameId(d.EntityName),
        count: matrix[nameId(d.DonorName)][nameId(d.EntityName)]
      }
    });

    let force = d3.layout.force()
               .nodes(nodes)
               .links(links)
               .gravity(0.5)
               .size([this.width, this.height]);

     force.start();
  }
}
