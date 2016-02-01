/**
 * Chapter 6: NodeJS server application
 */
"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var d3 = require('d3');
var readFile = require('fs').readFile;

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
    console.dir(airport);
    res.send(`<!doctype html>
      <html>
      <head>
        <title>Your nearest airport is: ${airport.point.name}</title>
      </head>
      <body style="text-align: center;">
        <h1>The airport closest to your location is: ${airport.point.name}</h1>
        <img src="${canvasOutput}" />
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
  let Image = Canvas.Image;
  console.log('1');
  let canvas = new Canvas(750, 750);
  let ctx = canvas.getContext('2d');
  console.log('2');
  let projection = d3.geo.equirectangular()
    .center([5, 56])
    .scale(250);
    console.log('3');

  let boundaries = require('earth-topojson/110m.json');
  let path = d3.geo.path()
    .projection(projection)
    .context(ctx);
    console.log('4');

  let airport = nearestVoronoi(location, airports);
  console.log('5');

  ctx.beginPath();
  path(topojson.feature(boundaries, boundaries.objects.countries));
  ctx.stroke();
  console.log('6');
  console.dir(topojson.feature(boundaries, boundaries.objects.countries));

  ctx.beginPath();
  path({ type: 'FeatureCollection',
  features:
   [{type: 'feature', geometry: airport.region}]});
  ctx.stroke();
  ctx.fill('#f00');


  return canvas.toDataURL();
}


// function drawMap(location, airports) {
//   let jsdom = require('jsdom');
//   let topojson = require('topojson');
//
//   let projection = d3.geo.equirectangular()
//     .center([5, 56])
//     .scale(250);
//
//   let boundaries = require('earth-topojson/110m.json');
//
//   let path = d3.geo.path()
//     .projection(projection);
//
//   let airport = nearestVoronoi(location, airports);
//
//   jsdom.env({
//         html:'',
//         features:{ QuerySelector:true }, //you need query selector for D3 to work
//         done:function(errors, window){
//           window.d3 = d3.select(window.document); //get d3 into the dom
//
//           let svg = window.d3.select('body')
//             .append('div').attr('class','container') //make a container div to ease the saving process
//             .append('svg')
//               .attr({
//                   xmlns:'http://www.w3.org/2000/svg',
//                   width: width,
//                   height: height
//                 })
//             .append('g')
//               .attr('transform','translate(' + width/2 + ',' + height/2 + ')');
//
//
//           //write out the children of the container div
//           return window.d3.select('.container').html();
//
//         }
//     });
// }


/**
 * Returns whether a point is inside a polygon.
 * The following function is taken from https://github.com/substack/point-in-polygon/
 *
 * Based on a ray-casting algorithm from http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 *
 * @param  {Array}                 point      An array with x and y coordinates of a point. Can also be lon/lat.
 * @param  {Array<Array<Number>>}  polygon    The polygon as an array of arrays containing x and y coordinates.
 * @return {Boolean}                          Whether the point is inside the polygon or not.
 */
function isInside(point, polygon) {
  let x = Number(point[0]), y = Number(point[1]);

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i][0], yi = polygon[i][1];
      let xj = polygon[j][0], yj = polygon[j][1];

      let intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Find the nearest point using Voronoi geom
 * @param  {String}               location Comma-separated lat/lng string
 * @param  {Array<Array<Number>>} points   An array of arrays containing points
 * @return {Object|Void}                   The nearest point to location. Throws Error if point not found.
 */
function nearestVoronoi(location, points) {
  let nearest = {};
  let projection = d3.geo.equirectangular();

  location = location.split(/,\s?/);

  let voronoi = d3.geom.voronoi(
    points.map((point) => {
      let projected = projection([point.longitude, point.latitude]);
      return [projected[0], projected[1], point];
    }))
    .filter((d) => d);

  voronoi.forEach((region) => {
    if (isInside(projection([location[1], location[0]]), region)) {
      nearest = {
        point: region.point[2],
        region: region
      };
    }
  });

  if (nearest === {}) throw new Error('Nearest not findable');
  else return nearest;
}
