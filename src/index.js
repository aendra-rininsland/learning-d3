import {TableBuilder} from './table-builder';

window.TableBuilder = TableBuilder;

let header = ['one', 'two', 'three', 'four', 'five', 'six'];

let rows = [
  header,
  ['q', 'w', 'e', 'r', 't', 'y']
];

let table = new TableBuilder(rows);

console.dir(table);
