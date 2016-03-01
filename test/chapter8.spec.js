import {TypeScriptChart} from '../src/chapter8.ts';
let data = require('../src/data/chapter1.json');
var chart = new TypeScriptChart(data);
var should = require('chai').should(); //eslint-disable-line

describe('ordering a TypeScriptChart', () => {
  describe('alphabetically', () => {
    it('should sort data ascending', () => {
      chart.order('alphabetical', 'asc');
      chart.x.domain().should.have.length(8);
      chart.x.domain()[0].should.equal('burundi');
      chart.x.domain()[7].should.equal('yemen');
    });
    it('should sort data descending', () => {
      chart.order('alphabetical', 'desc');
      chart.x.domain().should.have.length(8);
      chart.x.domain()[0].should.equal('yemen');
      chart.x.domain()[7].should.equal('burundi');
    });
  });

  describe('by population', () => {
    it('should sort data ascending', () => {
      chart.order('population', 'asc');
      chart.x.domain().should.have.length(8);
      chart.x.domain()[0].should.equal('liberia');
      chart.x.domain()[7].should.equal('syria');
    });
    it('should sort data descending', () => {
      chart.order('population', 'desc');
      chart.x.domain().should.have.length(8);
      chart.x.domain()[0].should.equal('syria');
      chart.x.domain()[7].should.equal('liberia');
    });
  });
});
