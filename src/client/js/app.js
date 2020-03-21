// Requirement
// - HTML form - enter location and date
// --  If trip is within a week, print current weather forecast
// --  Else, print predicted weather forecast

// Steps
// - Get coordinates of location using Geonames API
// - Get the weather of the coordinates from Dark Sky API
// - Get image of location from Pixabay API

import { trim } from "./helper";
import { setMinDate } from "./helper";
import { epochToDateString } from "./helper";

/* ~~~~~ FETCHING ALL HTML ELEMENTS ~~~~~ */
const form = document.getElementById("search-form");
const tripLocation = document.getElementById("trip-location-field");
const departDateLabel = document.getElementById("trip-date-label");
const departDate = document.getElementById("trip-date-field");
const saveButton = document.getElementById("trip-save-button");
const resetButton = document.getElementById("trip-reset-button");
const errorSection = document.getElementById("error-section");
const errorMessage = document.getElementById("error-message");

// set minimum date to todays date
setMinDate(departDateLabel, departDate);

/* ~~~~~ ATTACH EVENT HANDLER TO ELEMENTS ~~~~~ */
form.addEventListener("submit", handleSubmit);
saveButton.addEventListener("click", handleSubmit);
resetButton.addEventListener("click", handleReset);

/* ~~~~~ EVENT HANDLER FUNCTION DEFINITIONS ~~~~~ */
// handler to handle form submission and click on save button
async function handleSubmit(e) {
  e.preventDefault();
  console.log("Form submitted");

  // fetch all values submitted
  let destination = tripLocation.value;
  let departOn = new Date(departDate.value);

  // getting coordinates of location
  // let locationData = await getCoordinates(destination);

  // dummy data for testing
  let locationData = {
    error: false,
    city: "London",
    country: "United Kingdom",
    lat: 51.50853,
    long: -0.12574
  };

  // error handling based on results returned
  if (locationData.error) {
    console.log("ERROR : Location not found. Please try again.");
    handleError(1);
    return;
  }

  // calculate the difference in no. of days from today
  let today = new Date();
  let difference = (departOn - today) / (1000 * 3600 * 24);

  if (difference < 7) {
    console.log("Week date - use Forecast Request");
    getPresentWeather(locationData);
  } else {
    console.log("Future date - use Time Machine Request");
    getFutureWeather(locationData, departOn);
  }
}

async function getPresentWeather(data) {
  console.log("In getPresentWeather(data)");

  // https://api.darksky.net/forecast/[key]/[latitude],[longitude]&exclude=minutely,hourly,flags&units=si
  const key = "138476a80ce39e46213c3fe7c71ce908";

  const startString = "https://api.darksky.net/forecast/";
  const endString = "?&exclude=minutely,hourly,flags&units=si";

  const queryString =
    startString + key + "/" + data.lat + "," + data.long + endString;

  const fetch = require("node-fetch");

  const weatherData = await fetch(queryString);
  const weatherJSON = await weatherData.json();
  console.log(weatherJSON);

  // let jsonData = await fetch(queryString, {
  //   method: "GET",
  //   mode: "cors",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Access-Control-Allow-Origin": "*"
  //   }
  // })
  //   .then(res => res.json())
  //   .then(data => {
  //     console.log(data);
  //   });

  console.log(jsonData);
}

async function getFutureWeather(data, date) {
  console.log("In getFutureWeather(data, date)");
}

async function getCoordinates(destination) {
  // http://api.geonames.org/searchJSON?q=london&maxRows=1&username=coderapex
  const startString = "http://api.geonames.org/searchJSON?q=";
  const endString = "&maxRows=1&username=coderapex";

  // removing empty spaces from the query string
  destination = destination.replace(/\s/g, "%20");

  // setting final query string to call
  const queryString = startString + destination + endString;

  const locationData = await fetch(queryString);
  let jsonData = await locationData.json();
  // console.log(jsonData);

  // the result object will be returned and will contain the data about the location
  let result = {};

  // error handling in case of invalid city search result
  let resultCount = await jsonData.totalResultsCount;
  if (resultCount === 0) {
    // let result = {};
    result.error = true;
    result.locationData = {};
    return result;
  }

  let locationJSON = {};
  locationJSON.city = jsonData.geonames[0].toponymName;
  locationJSON.country = jsonData.geonames[0].countryName;
  locationJSON.long = jsonData.geonames[0].lng;
  locationJSON.lat = jsonData.geonames[0].lat;

  result.error = false;
  result.locationData = await locationJSON;

  return result;
}

function handleError(errorCode) {
  let error = "";

  switch (errorCode) {
    case 0:
      error = "Date invalid. Please enter a date in the future.";
      break;
    case 1:
      error =
        "Location invalid/not found. Please try with a different location. ";
      break;
    default:
      error = "Unknown Error";
      break;
  }

  if (errorCode === 0) {
    error =
      "Location invalid/not found. Please try with a different location. ";
  }

  errorMessage.innerHTML = error;
  errorSection.style.display = "block";

  setTimeout(() => {
    errorSection.style.display = "none";
    console.log("hidden");
  }, 5000);
}

function handleUserURLInput(event) {
  event.preventDefault();
  const url = document.getElementById("url-input").value;
  if (!url) {
    console.log("URL value not valid");
    return;
  }
  console.log(url);
  fetch("/analyse-url", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: url })
  })
    .then(res => res.json())
    .then(data => {
      let trimVal = trim(1.552368, 2);
      console.log(`🚀: handleUserURLInput -> trimVal : `, trimVal);
    });
}

function handleReset(e) {
  e.preventDefault();
  console.log("Reset Button clicked.");

  tripLocation.value = "";
  setMinDate(departDateLabel, departDate);
}

export { handleUserURLInput };
