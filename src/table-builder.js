/**
 * Table Builder!
 */

let d3 = require('d3');

export class TableBuilder {
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

export class TableBuilderClassic {
  constructor(rows) {
    let d3 = require('d3');

    // Remove the first element for the header
    this.header = rows.shift();
    this.data = rows; // Everything else is a normal row.

    let table = d3.select('body')
      .append('table').attr('class', 'table');

    let tableHeader = table.append('thead').append('tr');
    let tableBody = table.append('tbody');

    // Each element in "header" is a string.
    this.header.forEach(function(value){
      tableHeader.append('th').text(value);
    });

    // Each element in "data" is an array
    this.data.forEach((row) => {
      let tableRow = tableBody.append('tr');

      row.forEach((value) => {
        // Now, each element in "row" is a string
        tableRow.append('td').text(value);
      });
    });

    return table;
  }
}
