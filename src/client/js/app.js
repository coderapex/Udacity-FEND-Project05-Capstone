// Requirement
// - HTML form - enter location and date
// --  If trip is within a week, print current weather forecast
// --  Else, print predicted weather forecast

// Steps
// - Get coordinates of location using Geonames API
// - Get the weather of the coordinates from Dark Sky API
// - Get image of location from Pixabay API

import { trim, dateToEpoch, setMinDate, epochToDateString } from "./helper";
import {
  dummyCoordinateJSON,
  dummyImageJSON,
  dummyPresentForecast,
  dummyFutureForecast,
  dummyTripData
} from "./helper";

// variable to save all the data
let tripData = {};

/* ~~~~~ FETCHING ALL HTML ELEMENTS ~~~~~ */
const form = document.getElementById("search-form");
const tripLocation = document.getElementById("trip-location-field");
const departDateLabel = document.getElementById("trip-date-label");
const saveButton = document.getElementById("trip-save-button");
const resetButton = document.getElementById("trip-reset-button");
const errorSection = document.getElementById("error-section");
const errorMessage = document.getElementById("error-message");

const departDate = document.getElementById("trip-date-field");
const returnDate = document.getElementById("trip-end-field");
const departOn = new Date(departDate.value);
const returnOn = new Date(returnDate.value);

// set minimum date to todays date
setMinDate(departDateLabel, departDate, returnDate);

/* ~~~~~ ATTACH EVENT HANDLER TO ELEMENTS ~~~~~ */
form.addEventListener("submit", handleSubmit);
saveButton.addEventListener("click", handleSubmit);
resetButton.addEventListener("click", handleReset);

/* ~~~~~ EVENT HANDLER FUNCTION DEFINITIONS ~~~~~ */
// handler to handle form submission and click on save button
async function handleSubmit(e) {
  console.log("In handleSubmit()");
  e.preventDefault();

  try {
    const tripDatesData = calculateTripDates();
    // console.log(`🚀: handleSubmit -> tripDatesData`, tripDatesData);

    // fetch coordinates - production ready
    const coordinatesData = await getCoordinates(tripLocation.value);
    // for development
    // const coordinatesData = dummyCoordinateJSON;
    // console.log(`🚀: handleSubmit -> coordinatesData`, coordinatesData);

    // fetch image of location - production ready
    const imageData = await getImageData(coordinatesData);
    // for development
    // const imageData = dummyImageJSON;
    // console.log(`🚀: handleSubmit -> imageData`, imageData);

    // fetch weather forecast - production ready
    const forecastData = await getForecastData(tripDatesData, coordinatesData);
    // for development
    // const forecastData = dummyPresentForecast;
    // const forecastData = dummyFutureForecast;
    // console.log(`🚀: handleSubmit -> forecastData`, forecastData);

    // updating the UI after all results are fetched
    renderUI(tripDatesData, coordinatesData, imageData, forecastData);
  } catch (error) {
    console.log("Error in handleSubmit");
    console.log(error);
  }
}

function renderUI(tripDates, coordinates, image, forecast) {
  console.log("- In renderUI()");
  // let departOn = new Date(departDate.value);
  // let returnOn = new Date(returnDate.value);

  let tripData = {
    city: coordinates.geonames[0].name,
    country: coordinates.geonames[0].countryName,
    daysLeft: tripDates.daysLeft,
    departure: epochToDateString(dateToEpoch(departOn)),
    duration: Math.floor((returnOn - departOn) / (1000 * 3600 * 24)),
    forecast: forecast.daily.data,
    imgURL: image.hits[0].webformatURL,
    return: epochToDateString(dateToEpoch(returnOn))
  };

  // for development
  // tripData = dummyTripData;
  // console.log(tripdata);

  /* ***** ***** ***** */

  console.log("In renderTripData()");

  // getting all HTML Elements
  const resultSection = document.getElementById("result-section");
  const tripDuration = document.getElementById("trip-duration");
  const locationImage = document.getElementById("location-image");
  const cityName = document.getElementById("city-name");
  const countryName = document.getElementById("country-name");
  const departDate = document.getElementById("depart");
  const returnDate = document.getElementById("return");
  const singleForecast = document.getElementById("single-forecast");
  const minMax = document.getElementById("min-max");
  const humidity = document.getElementById("humidity");
  const wind = document.getElementById("wind");
  const daysLeft = document.getElementById("days-left");
  const multiForecast = document.getElementById("multi-forecast");

  // make result section visible
  resultSection.style.display = "block";

  // updating core trip information in the UI
  let tripLengthString = "";
  if (tripData.duration == 0) tripLengthString = ` 1 day `;
  else tripLengthString = ` ${tripData.duration + 1} days `;
  tripDuration.innerHTML = tripLengthString;

  locationImage.setAttribute("src", tripData.imgURL);

  cityName.innerHTML = tripData.city;
  countryName.innerHTML = tripData.country;
  departDate.innerHTML = tripData.departure;
  returnDate.innerHTML = tripData.return;
  daysLeft.innerHTML = ` ${Math.ceil(tripData.daysLeft)} `;

  // updating the UI based on tripData forecast
  if (tripData.forecast.length == 1) {
    multiForecast.style.display = "none";
    singleForecast.style.display = "grid";

    const dayForecast = tripData.forecast[0];

    const max = dayForecast.temperatureMax;
    const min = dayForecast.temperatureMin;
    minMax.innerHTML = `${min}/${max}`;

    humidity.innerHTML = dayForecast.humidity;
    wind.innerHTML = dayForecast.windSpeed + " kmph";
  } else {
    singleForecast.style.display = "none";
    multiForecast.style.display = "grid";
    multiForecast.innerHTML = "";

    const weekForecast = tripData.forecast;

    weekForecast.forEach(entry => {
      let time = entry.time;
      let dateFull = epochToDateString(time);
      let date = dateFull.slice(0, dateFull.length - 4);

      let min = entry.temperatureMin;
      let max = entry.temperatureMax;

      let html = `
          <div class="day-forecast">
            <div class="date">${date}</div>
            <div>
              <span class="day-min">${min}</span>
              <span class="day-max">${max}</span>
            </div>
          </div>
        `;

      // h.insertAdjacentHTML("afterend", "<p>My new paragraph</p>");
      multiForecast.insertAdjacentHTML("beforeend", html);
    });
  }
  console.log("- Exiting renderUI()");
}

async function getForecastData(tripDatesData, coordinatesData) {
  console.log("- In getForecastData()");

  try {
    // let dateValue = new Date(departDate.value);
    let bodyData = {
      daysLeft: tripDatesData.daysLeft,
      lat: coordinatesData.geonames[0].lat,
      long: coordinatesData.geonames[0].lng,
      date: new Date(departDate.value)
    };

    let weatherData = await fetch(`/fetch-forecast`, {
      method: "post",
      body: JSON.stringify(bodyData),
      headers: { "Content-Type": "application/json" }
    });
    const weatherJSON = await weatherData.json();
    console.log(weatherJSON);

    console.log("- Exiting getForecastData()");

    return weatherJSON;
  } catch (error) {
    console.log("Error Occurred:");
    console.log(error);
  }
}

async function getImageData(coordinatesData) {
  console.log("- In getImageData(coordinatesData)");

  try {
    let bodyData = {
      city: coordinatesData.geonames[0].name,
      country: coordinatesData.geonames[0].countryName
    };
    // console.log(`🚀: getImageData -> bodyData`, bodyData);

    let fetchedData = await fetch("/get-image", {
      method: "post",
      body: JSON.stringify(bodyData),
      headers: { "Content-Type": "application/json" }
    }).then(res => res.json());
    console.log(`🚀: getImageData -> fetchedData`, fetchedData);

    console.log("- Exiting getImageData(coordinatesData)");

    return fetchedData;
  } catch (error) {
    console.log("Error in getImageData(coordinatesData):");
    console.log(error);
  }
}

function calculateTripDates() {
  console.log("- In calculateTripDates()");

  let tripData = {};

  // fetch all values submitted
  let departOn = new Date(departDate.value);
  let returnOn = new Date(returnDate.value);

  // calculate the difference in no. of days from today
  let today = new Date();
  let difference = (departOn - today) / (1000 * 3600 * 24);

  tripData.departure = epochToDateString(dateToEpoch(departOn));
  tripData.return = epochToDateString(dateToEpoch(returnOn));
  tripData.daysLeft = difference;
  tripData.duration = Math.floor((returnOn - departOn) / (1000 * 3600 * 24));

  console.log(`🚀: calculateTripDates -> tripData`, tripData);

  console.log("- Exiting calculateTripDates()");

  return tripData;
}

async function getCoordinates(locationString) {
  console.log("- In getCoordinates(locationString)");

  try {
    const fetchedData = await fetch("/fetch-coordinates", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ locationString: locationString })
    }).then(res => res.json());

    console.log(`🚀: getCoordinates -> fetchedData`, fetchedData);
    console.log("- Exiting getCoordinates(locationString)");

    return fetchedData;
  } catch (error) {
    console.log("Error Occurred:");
    console.log(error);
  }
}

function handleReset(e) {
  e.preventDefault();
  console.log("In handleReset()");

  tripLocation.value = "";
  setMinDate(departDateLabel, departDate, returnDate);
}
