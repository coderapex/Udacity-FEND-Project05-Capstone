// Requirement
// - HTML form - enter location and date
// --  If trip is within a week, print current weather forecast
// --  Else, print predicted weather forecast

// Steps
// - Get coordinates of location using Geonames API
// - Get the weather of the coordinates from Dark Sky API
// - Get image of location from Pixabay API

import { trim, dateToEpoch, setMinDate, epochToDateString } from "./helper";

// variable to save all the data
let tripData = {};

/* ~~~~~ FETCHING ALL HTML ELEMENTS ~~~~~ */
const form = document.getElementById("search-form");
const tripLocation = document.getElementById("trip-location-field");
const departDateLabel = document.getElementById("trip-date-label");
const departDate = document.getElementById("trip-date-field");
const returnDate = document.getElementById("trip-end-field");
const saveButton = document.getElementById("trip-save-button");
const resetButton = document.getElementById("trip-reset-button");
const errorSection = document.getElementById("error-section");
const errorMessage = document.getElementById("error-message");

// set minimum date to todays date
setMinDate(departDateLabel, departDate, returnDate);

/* ~~~~~ ATTACH EVENT HANDLER TO ELEMENTS ~~~~~ */
form.addEventListener("submit", handleSubmit);
saveButton.addEventListener("click", handleSubmit);
resetButton.addEventListener("click", handleReset);

/* ~~~~~ EVENT HANDLER FUNCTION DEFINITIONS ~~~~~ */
// handler to handle form submission and click on save button
async function handleSubmit(e) {
  e.preventDefault();
  console.log("In handleSubmit()");
}

function handleReset(e) {
  e.preventDefault();
  console.log("In handleReset()");

  tripLocation.value = "";
  setMinDate(departDateLabel, departDate, returnDate);
}
