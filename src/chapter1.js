/**
 * Chapter 1 example code
 */
import {BasicBarChart} from './basic-bar-chart';

/**
 * Import the chapter1 data.
 * @type {Object}
 */
let data = require('./data/chapter1.json'); // Data from UNHCR, 2015.11.01: http://data.unhcr.org/api/population/regional.json

/**
 * Total population numbers for each area.
 * @type {Array}
 */
let totalNumbers = data.filter((obj) => {return obj.population.length; })
  .map((obj) => {
    return {
      name: obj.name,
      population: Number(obj.population[0].value)
    };
  });


new BasicBarChart(totalNumbers);

/**
 * Import our CSS
 * @param  {CSS file} './index.css'
 */
require('./index.css');
