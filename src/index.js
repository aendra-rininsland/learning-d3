import {TableBuilder} from './table-builder';

let header = ['one', 'two', 'three', 'four', 'five', 'six'];
let rows = [
  ['q', 'w', 'e', 'r', 't', 'y']
];

let table = new TableBuilder([header, rows]);

console.dir(table);
