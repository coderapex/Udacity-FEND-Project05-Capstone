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

// fetching all elements
const form = document.getElementById("search-form");
// console.log(`🚀: form`, form);

const tripLocation = document.getElementById("trip-location-field");
// console.log(`🚀: tripLocation`, tripLocation);

const departDateLabel = document.getElementById("trip-date-label");

const departDate = document.getElementById("trip-date-field");
// console.log(`🚀: departDate`, departDate);

const saveButton = document.getElementById("trip-save-button");
// console.log(`🚀: saveButton`, saveButton);

const resetButton = document.getElementById("trip-reset-button");
// console.log(`🚀: resetButton`, resetButton);

// set minimum date to todays date
setMinDate(departDateLabel, departDate);

// set up event handlers
form.addEventListener("submit", handleSubmit);
saveButton.addEventListener("click", handleSubmit);
resetButton.addEventListener("click", handleReset);

// event handler definitions
async function handleSubmit(e) {
  e.preventDefault();
  console.log("Form submitted");

  // fetch all values submitted
  let destination = tripLocation.value;
  let departOn = departDate.value;

  // getting coordinates of location
  let data = await getCoordinates(destination);
  console.log("Geonames call made. Result is:");
  console.log(data);
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
  console.log(jsonData);

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
