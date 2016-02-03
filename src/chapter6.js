/**
 * Chapter 6: NodeJS server application
 */

import express from 'express';
import bodyParser from 'body-parser';
import d3 from 'd3';
import {readFile} from 'fs';

import {nearestVoronoi} from './helpers';

var app = express();

app.use(bodyParser.urlencoded());

// app.get('/', (req, res) => { res.send('Hi there!'); });

app.get('/', (req, res) => {
  res.send(`<!doctype html>
    <html>
    <head>
      <title>Find your nearest airport!</title>
    </head>
    <body>
      <form method="POST">
        <h1>Enter your latitude and longitude, or allow your browser to check.</h1>
        <input type="text" name="location" id="latlon" /> <br />
        <input type="submit" value="Check" />
      </form>
      <script type="text/javascript">
      navigator.geolocation.getCurrentPosition(function(position) {
        document.getElementById('latlon').value = position.coords.latitude + ',' + position.coords.longitude;
      });
      </script>
    </body>
    </html>`);
});

app.post('/', (req, res) => {
  let location = req.body.location;

  let airportPromise = new Promise((res, rej) =>
    readFile('src/data/airports.dat', 'utf8', (err, data) => err ? rej (err) : res(data)));

  airportPromise.then((airportData) => {
    let points = d3.csv.parseRows(airportData)
      .filter((airport) => !airport[5].match(/\N/) && airport[4] !== '')
      .map((airport) => {
        return {
          name: airport[1],
          location: airport[2],
          country: airport[3],
          code: airport[4],
          latitude: airport[6],
          longitude: airport[7],
          timezone: airport[11]
        }
      });

    let airport = nearestVoronoi(location, points);
    let canvasOutput = drawCanvasMap(location, points);
    res.send(`<!doctype html>
      <html>
      <head>
        <title>Your nearest airport is: ${airport.point.name}</title>
      </head>
      <body style="text-align: center;">
        <h1>The airport closest to your location is: ${airport.point.name}</h1>
        <img style="width: 480px; height: 250px;" src="${canvasOutput}" />
        <table style="margin: 0 auto;">
        <tr>
          ${Object.keys(airport.point).map((v) => `<th>${v}</th>`).join('')}
        </tr>
        <tr>
          ${Object.keys(airport.point).map((v) => `<td>${airport.point[v]}</td>`).join('')}
        </tr>
      </body>
      </html>`);
  })
  .catch((err) => console.log(err));
});

app.listen(process.env.PORT || 8081, () => {
  console.log("We're up and running on " + (process.env.PORT || 8081));
});

function drawCanvasMap(location, airports) {
  let Canvas = require('canvas');
  let topojson = require('topojson');

  let canvas = new Canvas(960, 500);
  let ctx = canvas.getContext('2d');
  let projection = d3.geo.mercator()
    .center([location.split(/,\s?/)[1], location.split(/,\s?/)[0]])
    .scale(2500);

  let boundaries = require('earth-topojson/110m.json');
  let path = d3.geo.path()
    .projection(projection)
    .context(ctx);

  let airport = nearestVoronoi(location, airports);

  let airportProjected = projection([airport.point.longitude, airport.point.latitude]);

  ctx.fillStyle = '#f00';
  ctx.fillRect(airportProjected[0] - 5 , airportProjected[1] - 5, 10, 10);


  ctx.beginPath();
  path(topojson.feature(boundaries, boundaries.objects.countries));
  ctx.stroke();


  return canvas.toDataURL();
}
