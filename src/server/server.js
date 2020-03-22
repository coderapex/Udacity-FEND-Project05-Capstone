// Setup empty JS object to act as endpoint for all routes
const projectData = [];

// Require Express to run server and routes
const express = require("express");

// Start up an instance of app
const app = express();

// setting constants for parsing and managing cors
const bodyParser = require("body-parser");
const cors = require("cors");

// using fetch api in node
const fetch = require("node-fetch");

/* Middleware*/
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cors for cross origin allowance
app.use(cors());

// Initialize the main project folder
app.use(express.static("dist"));

// Spin up the server
const port = 8888;
const serverListen = () => {
  console.log(`running on localhost: ${port}`);
};
const server = app.listen(port, serverListen);

// base route to display index.html page
app.get("/", function(req, res) {
  res.sendFile("dist/index.html");
});

// GET route will return contents of projectData
const returnProjectData = (request, response) => {
  console.log(projectData);
  response.send(projectData);
};

app.get("/all", returnProjectData);

// GET route to fetch the present weather data
app.post("/present-weather", async (request, response) => {
  const lat = request.body.lat;
  const long = request.body.long;

  let queryString = darkSkyPresentQuery(lat, long);

  console.log("Present query string:");
  console.log(queryString);

  const weatherData = await fetch(queryString);
  // console.log("weatherData");
  // console.log(weatherData);
  const weatherJSON = await weatherData.json();
  // console.log("weatherJSON");
  // console.log(weatherJSON);

  response.send(weatherJSON);
});

// GET route to fetch the future weather data on specified date
app.post("/future-weather", async (request, response) => {
  const lat = request.body.lat;
  const long = request.body.long;
  const date = request.body.date;

  let queryString = darkSkyFutureQuery(lat, long, date);

  console.log("Future query string:");
  console.log(queryString);

  const weatherData = await fetch(queryString);
  // console.log("weatherData");
  // console.log(weatherData);
  const weatherJSON = await weatherData.json();
  // console.log("weatherJSON");
  // console.log(weatherJSON);

  response.send(weatherJSON);
});

app.post("/get-image", async (request, response) => {
  const city = request.body.city;
  const country = request.body.country;

  let queryString = pixabayQuery(city, country);
  // console.log(queryString);

  const imageData = await fetch(queryString);
  // console.log("imageData");
  // console.log(imageData);
  const imageJSON = await imageData.json();
  // console.log("imageJSON");
  // console.log(imageJSON);

  response.send(imageJSON);
});

function pixabayQuery(city, country) {
  city = city.replace(/\s+/g, "+").toLowerCase();
  country = country.replace(/\s+/g, "+").toLowerCase();

  let query = `${city}+${country}`;

  const pixabayKey = "15691331-4cc15662277207ca9104dc184";

  // https://pixabay.com/api/?key={key}&q={query}&image_type=photo&orientation=vertical&per_page=3

  const startString = `https://pixabay.com/api/?key=${pixabayKey}&q=`;
  const endString = `&image_type=photo&orientation=vertical&per_page=3`;

  const queryString = startString + query + endString;
  return queryString;
}

// POST route will add received data to ProjectData
const addProjectData = (request, response) => {
  newEntry = {
    temperature: request.body.temperature,
    date: request.body.date,
    userResponse: request.body.userResponse
  };

  projectData.unshift(newEntry);
};

app.post("/add", addProjectData);

/* ~~~~~ HELPER FUNCTIONS ~~~~~ */

function darkSkyPresentQuery(lat, long) {
  // https://api.darksky.net/forecast/[darkskyKey]/[latitude],[longitude]&exclude=minutely,hourly,flags&units=si
  const darkskyKey = "138476a80ce39e46213c3fe7c71ce908";

  const startString = "https://api.darksky.net/forecast/";
  const endString = "?&exclude=minutely,hourly,flags&units=si";

  const queryString =
    startString + darkskyKey + "/" + lat + "," + long + endString;
  // console.log(queryString);

  return queryString;
}

function darkSkyFutureQuery(lat, long, date) {
  //   https://api.darksky.net/forecast/[darkskyKey]/[latitude],[longitude],[time]&exclude=minutely,hourly,flags&units=si
  const darkskyKey = "138476a80ce39e46213c3fe7c71ce908";

  const startString = "https://api.darksky.net/forecast/";
  const endString = "?&exclude=minutely,hourly,flags&units=si";

  // converting variable date to datatype date before applying any date function on it
  let timestamp = new Date(date);
  timestamp = Math.floor(timestamp.getTime() / 1000.0);

  const queryString =
    startString +
    darkskyKey +
    "/" +
    lat +
    "," +
    long +
    "," +
    timestamp +
    endString;
  // console.log(queryString);

  return queryString;
}
