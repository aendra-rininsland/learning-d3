import {BasicBarChart} from './basic-bar-chart';

let data = require('./data/chapter1.json');

let totalNumbers = data.filter((obj) => {return obj.population.length; })
  .map((obj) => {
    return {
      name: obj.name,
      population: Number(obj.population[0].value)
    };
  });


new BasicBarChart(totalNumbers);
