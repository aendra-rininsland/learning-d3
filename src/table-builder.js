/**
 * Table Builder!
 */

let d3 = require('d3');

export default class TableBuilder {
  constructor(url) {
    this.load(url);

    this.table = d3.select('body').append('table').attr('class', 'table');
    this.tableHeader = this.table.append('thead');
    this.tableBody = this.table.append('tbody');
  }

  load(url) {
    d3.csv(url, (data) => {
      this.data = data;
      this.redraw();
    });
  }

  redraw() {
    let nested = d3.nest()
      .key(d => d['Raw_Guest_List'])
      .entries(this.data);

    this.data = nested.map(d => {
      let earliest = d.values.sort((a, b) => d3.ascending(a.YEAR, b.YEAR)).shift();

      return {
        name: d.key,
        category: earliest.Group,
        'earliest appearance': earliest.YEAR
      }
    });

    this.rows = this.tableBody.selectAll('tr').data(this.data);
    this.rows.enter().append('tr');
    this.rows.exit().remove();

    this.rows.selectAll('td')
      .data(d => d3.values(d))
      .enter()
      .append('td')
      .text(d => d);
  }
}
