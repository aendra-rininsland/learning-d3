import * as d3 from 'd3';
import {BasicChart} from './basic-chart';

export class TypeScriptChart extends BasicChart{
  constructor(data: Array<ITypeScriptChartDatum>) {
    super(data);

      this.data = data.filter((obj) => obj.population.length > 0)
        .map((obj) => {
          return {
            name:  obj.name,
            population: Number(obj.population[0].value)
          };
        });

      this.x = d3.scale.ordinal().rangeRoundBands([this.margin.left, this.width - this.margin.right], 0.1);
      this.y = d3.scale.linear().range([this.height, this.margin.bottom]);

      this.x.domain(this.data.map((d) => d.name ));
      this.y.domain([0, d3.max(this.data, (d) => d.population)]);

      let xAxis = d3.svg.axis().scale(this.x).orient('bottom');
      let yAxis = d3.svg.axis().scale(this.y).orient('left');

      this.chart.append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0, ${this.height})`)
          .call(xAxis);

      this.chart.append('g')
          .attr('class', 'y axis')
          .attr('transform', `translate(${this.margin.left}, 0)`)
          .call(yAxis);

      this.bars = this.chart.selectAll('rect')
          .data(this.data)
          .enter()
          .append('rect')
          .attr('class', 'bar')
          .attr('x', (d) => this.x(d.name))
          .attr('width', this.x.rangeBand())
          .attr('y', () => this.y(this.margin.bottom))
          .attr('height', 0);

      this.bars.transition()
        .delay((d, i) => i*200)
        .duration(800)
        .attr('y', (d) => this.y(d.population))
        .attr('height', (d) => this.height - this.y(d.population));
  }

  order(type, direction) {
    this.data = this.data.sort((a, b) => {
      switch(type) {
        case 'population':
          return direction.indexOf('asc') ?
            b.population - a.population : a.population - b.population;
        case 'alphabetical':
          return direction.indexOf('asc') ?
            (a.name < b.name ? 1 : a.name > b.name ? - 1 : 0) :
            (a.name > b.name ? 1 : a.name < b.name ? - 1 : 0);
      }
    });

    this.redraw();
  }

  redraw() {
    this.bars.data(this.data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', (d) => this.x(d.name))
        .attr('width', this.x.rangeBand())
        .attr('y', () => this.y(this.margin.bottom))
        .attr('height', 0);

    this.bars.transition()
      .delay((d, i) => i*200)
      .duration(800)
      .attr('y', (d) => this.y(d.population))
      .attr('height', (d) => this.height - this.y(d.population));

    this.x.domain(this.data.map((d) => d.name ));
    let xAxis = d3.svg.axis().scale(this.x).orient('bottom');
    this.chart.select('.x.axis').call(xAxis);
  }

  data: Array<{name: string; population: number}>;
  x: d3.scale.Ordinal<string, number>;
  y: d3.scale.Linear<number, number>;
  bars: d3.Selection<{name: string; population: number}>;
}

interface ITypeScriptChartDatum {
  population: Array<IPopulation>;
  name: string;
}

interface IPopulation {
  module_name: Array<any>;
  module_type: string;
  value: string;
  demography: {
    "04M": string;
    "04F": string;
    "511M": string;
    "511F": string;
    "1217M": string;
    "1217F": string;
    "1859M": string;
    "1859F": string;
    "60M": string;
    "60F": string;
  }
}
