/**
 * Chapter 6: NodeJS server application
 */

import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import d3 from 'd3';

let app = express();

app.use(bodyParser.json());

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
        <input type="text" name="latlon" id="latlon" /> <br />
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
  console.log(location);
  // let airport = new VoronoiAirports(location);

  res.send(`<!doctype html>
    <html>
    <head>
      <title>Your nearest airport is: ${airport.name}</title>
    </head>
    <body>
      <div class="chart">
        
      </div>
      <h1>The airport closest to your location is: ${airport.name}</h1>
    </body>
    </html>`);
});

app.listen(process.env.PORT || 8081, () => {
  console.log("We're up and running on " + (process.env.PORT || 8081));
});

class VoronoiAirports {
  constructor(location) {

  }


}
