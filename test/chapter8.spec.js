import {TypeScriptChart} from '../src/chapter8.ts';
let data = require('./data/chapter1.json');
var chart = new TypeScriptChart(data);

describe('ordering a TypeScriptChart', () => {
  describe('ordering a chart alphabetically', () => {
    it('should sort data ascending', () => {
      chart.order('alphabetical', 'asc');
      chart.x.domain().should.equal(['burundi', 'car', 'horn', 'liberia', 'mali', 'southsudan', 'syria', 'yemen']);
    });
    it('should sort data descending', () => {
      chart.order('alphabetical', 'desc');
      chart.x.domain().should.equal(['yemen', 'syria', 'southsudan', 'mali', 'liberia',  'horn', 'car', 'burundi']);
    });
  });

  describe('ordering a chart by population', () => {
    it('should sort data ascending', () => {
      chart.order('population', 'asc');
      chart.x.domain().should.equal(['liberia', 'yemen', 'mali', 'burundi', 'car', 'southsudan', 'horn', 'syria']);
    });
    it('should sort data descending', () => {
      chart.order('population', 'desc');
      chart.x.domain().should.equal(['syria', 'horn', 'southsudan', 'car', 'burundi', 'mali', 'yemen', 'liberia']);
    });
  });
});
