import {BasicChart} from './basic-chart';

export class EasingChart extends BasicChart {
  constructor(data) {
    super(data);

    let eases = ['linear', 'poly(4)', 'quad', 'cubic', 'sin', 'exp',
    'circle', 'elastic(10, -5)', 'back(0.5)', 'bounce', 'cubic-in',
    'cubic-out', 'cubic-in-out', 'cubic-out-in'],
    y = d3.scale.ordinal().domain(eases).rangeBands([50, 500]);
    let svg = this.chart;

    eases.forEach((ease) => {
      let transition = svg.append('circle')
        .attr({cx: 130, cy: y(ease), r: y.rangeBand()/2-5})
        .transition()
        .delay(400)
        .duration(1500)
        .attr({cx: 400});

      if (ease.indexOf('(') > -1) {
        let args = ease.match(/[0-9]+/g),
          type = ease.match(/^[a-z]+/);
        transition.ease(type, args[0], args[1]);
      } else {
        transition.ease(ease);
      }

      svg.append('text')
        .text(ease)
        .attr({x: 10, y: y(ease)+5});
    });


  }
}

export class Spirograph extends BasicChart {
  constructor(data) {
    super(data);

    let chart = this.chart;

    let position = (t) => {
      let a = 80, b = 1, c = 1, d = 80;
      return {x: Math.cos(a*t) - Math.pow(Math.cos(b*t), 3),
              y: Math.sin(c*t) - Math.pow(Math.sin(d*t), 3)};
    };


    let tScale = d3.scale.linear().domain([500, 25000]).range([0, 2*Math.PI]),
      x = d3.scale.linear().domain([-2, 2]).range([100, this.width-100]),
      y = d3.scale.linear().domain([-2, 2]).range([this.height-100, 100]);

    let brush = chart.append('circle')
      .attr({r: 4}),
      previous = position(0);

    let step = (time) => {
      if (time > tScale.domain()[1]) {
        return true;
      }

      let t = tScale(time),
        pos = position(t);

      brush.attr({cx: x(pos.x), cy: y(pos.y)});

      this.chart.append('line')
          .attr({x1: x(previous.x),
            y1: y(previous.y),
            x2: x(pos.x),
            y2: y(pos.y),
            stroke: 'steelblue',
            'stroke-width': 1.3});

      previous = pos;
    };

    let timer = d3.timer(step, 500);

  }
}

export class PrisonPopulationChart extends BasicChart {
  constructor(path) {
    super();

    this.margin.left = 50;
    let d3 = require('d3');

    let p = new Promise((res, rej) => {
      d3.csv(path, (err, data) => err ? rej(err) : res(data));
    });

    require('./index.css');

    p.then((data) => {
      this.data = data;
      this.drawChart();
    });
  }

  initialYears = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2015];

  drawChart(years = this.initialYears) {
    console.dir(years);
    let data = this.data;
    data = data.filter((d) => d.year >= d3.min(data, (d) => d.year) && d.year <= d3.max(data, (d)=> d.year));

    this.x = d3.scale.ordinal().rangeRoundBands([this.margin.left, this.width - this.margin.right], 0.1);
    this.y = d3.scale.linear().range([this.height, this.margin.bottom]);

    this.x.domain(data.map((d) => d.year));
    this.y.domain([0, d3.max(data, (d) => Number(d.total))]);

    this.xAxis = d3.svg.axis().scale(this.x).orient('bottom').tickValues(years)
    this.yAxis = d3.svg.axis().scale(this.y).orient('left');

    this.chart.append('g')
        .attr('class', 'axis-x axis')
        .attr('transform', `translate(0, ${this.height})`)
        .call(this.xAxis);

    this.chart.append('g')
        .attr('class', 'axis-y axis')
        .attr('transform', `translate(${this.margin.left}, 0)`)
        .call(this.yAxis);

    this.bars = this.chart.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .style('x', (d) => this.x(d.year))
        .style('y', () => this.y(0))
        .style('width', this.x.rangeBand())
        .style('height', 0);

    // Run CSS animation
    setTimeout(()=> {
      this.bars.classed('bar', true)
      .style('height', (d) => this.height - this.y(d.total) )
        .style('y', (d) => this.y(d.total));
    }, 1000);
  }
}

export class InteractivePrisonPopulationChart extends PrisonPopulationChart {


  constructor(path) {
    super(path);
    this.height = window.innerHeight * (2/3);
    this.addUIElements();
  }

  chapters = [
    {label: '1900–2015', domain: [1900, 2015], cb: this.loadScene1.bind(this)},
    {label: '1900–1930', domain: [1900, 1930], cb: this.loadScene2.bind(this)},
    {label: '1930–1960', domain: [1930, 1960], cb: this.loadScene3.bind(this)},
    {label: '1960–1990', domain: [1960, 1990], cb: this.loadScene4.bind(this)},
    {label: '1990–2015', domain: [1990, 2015], cb: this.loadScene5.bind(this)}
  ]

  addUIElements() {
    let context = this;
    this.buttons = d3.select('#chart').selectAll('.button')
      .data(this.chapters).enter()
      .append('button')
      .classed('scene', true)
      .text((d) => d.label)
      .on('click', d => d.cb())
      .on('touchstart', d => d.cb());

    this.words = d3.select('#chart').append('div');
    this.words.classed('words', true);
  }

  clearSelected() {
    d3.selectAll('.selected').classed('selected', false);
  }

  updateData() {
    // Update axes
    // d3.select('.axis-x').call(this.xAxis);
    // d3.select('.axis-y').call(this.yAxis);

    // Update bars
    this.bars.style('height', (d) => this.height - this.y(d.total) )
      .style('y', (d) => this.y(d.total))
      .style('x', (d) => this.x(d.year))
      .style('width', this.x.rangeBand());
  }

  loadScene1() {
    this.clearSelected();
    // this.x.domain(this.chapters[0].domain);
    // this.y.domain([0, d3.max(this.data, d => d.year)]);
    this.drawChart();
    this.words.html('In general, the rise in prison population over the last century reflects the rise in general population.');
  }
  loadScene2() {
    this.clearSelected();
    this.bars.filter((d) => [1914, 1915, 1916, 1917, 1918].indexOf(Number(d.year)) > -1).classed('selected', true);
    this.drawChart(d3.range(1900, 1930));
    this.words.html('Prison numbers fall, and then – as men return from the battlefields of the First World War – start to rise to new heights.');
  }
  loadScene3() {
    this.clearSelected();
    this.x.domain(this.chapters[2].domain);
    this.words.html('The number of people behind bars remains broadly stable, but again starts to rise as men are demobbed after the Second World War.');
  }
  loadScene4() {
    this.clearSelected();
    this.x.domain(this.chapters[3].domain);
    this.words.html('A consumer society has now fully arrived, and with it more goods to tempt thieves, robbers and burglars, resulting in a steady rise in the criminal population.');
  }
  loadScene5() {
    this.clearSelected();
    this.x.domain(this.chapters[4].domain);
    this.words.text('The penal system becomes the latest battleground for the Conservatives and Labour – particularly after the 1993 murder of James Bulger – which helps drive up the jail population.');
  }
}
