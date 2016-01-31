/**
 * Chapter 6: NodeJS server application
 */

let express = require('express');
let bodyParser = require('body-parser');
let d3 = require('d3');
let fs = require('fs');

import {nearestVoronoi} from './helpers';

let app = express();

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
    fs.readFile('src/data/airports.dat', 'utf8', (err, data) => err ? rej (err) : res(data)));

  airportPromise.then((airportData) => {
    let points = d3.csv.parseRows(airportData).map((airport) => {
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

    res.send(`<!doctype html>
      <html>
      <head>
        <title>Your nearest airport is: ${airport.name}</title>
      </head>
      <body style="text-align: center;">
        <h1>The airport closest to your location is: ${airport.name}</h1>
        <table style="margin: 0 auto;">
        <tr>
          ${Object.keys(airport).map((v) => `<th>${v}</th>`).join('')}
        </tr>
        <tr>
          ${Object.keys(airport).map((v) => `<td>${airport[v]}</td>`).join('')}
        </tr>
      </body>
      </html>`);
  })
  .catch((reas) => console.log(reas));
});

app.listen(process.env.PORT || 8081, () => {
  console.log("We're up and running on " + (process.env.PORT || 8081));
});
