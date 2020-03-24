// Requirement
// - HTML form - enter location and date
// --  If trip is within a week, print current weather forecast
// --  Else, print predicted weather forecast

// Steps
// - Get coordinates of location using Geonames API
// - Get the weather of the coordinates from Dark Sky API
// - Get image of location from Pixabay API

import { trim, dateToEpoch, epochToDateString } from "./helper";
import {
  dummyCoordinateJSON,
  dummyImageJSON,
  dummyPresentForecast,
  dummyFutureForecast,
  dummyTripData
} from "./helper";

/* ~~~~~ FETCHING ALL HTML ELEMENTS ~~~~~ */
const form = document.getElementById("search-form");
const tripLocation = document.getElementById("trip-location-field");
const departDateLabel = document.getElementById("trip-date-label");
const saveButton = document.getElementById("trip-save-button");
const resetButton = document.getElementById("trip-reset-button");
const errorSection = document.getElementById("error-section");
const errorMessage = document.getElementById("error-message");

const departDateInput = document.getElementById("trip-date-field");
const returnDateInput = document.getElementById("trip-end-field");

// set minimum date to todays date
setMinDate(departDateLabel, departDateInput, returnDateInput);

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

export { handleSubmit };

const departOn = new Date(departDateInput.value);
const returnOn = new Date(returnDateInput.value);

function renderUI(tripDates, coordinates, image, forecast) {
  console.log("- In renderUI()");
  // let departOn = new Date(departDateInput.value);
  // let returnOn = new Date(returnDateInput.value);

  let tripData = {
    city: coordinates.geonames[0].name,
    country: coordinates.geonames[0].countryName,
    daysLeft: tripDates.daysLeft,
    departure: epochToDateString(dateToEpoch(departOn)),
    // duration: Math.floor((returnOn - departOn) / (1000 * 3600 * 24)),
    duration: tripDates.duration,
    forecast: forecast.daily.data,
    imgURL: image.hits[0].webformatURL,
    return: epochToDateString(dateToEpoch(returnOn))
  };

  // for development
  // let tripData = dummyTripData;
  // console.log(tripdata);

  /* ***** ***** ***** */

  // getting all HTML Elements
  const resultSection = document.getElementById("result-section");
  const tripDuration = document.getElementById("trip-duration");
  const locationImage = document.getElementById("location-image");
  const cityName = document.getElementById("city-name");
  const countryName = document.getElementById("country-name");
  const departDateText = document.getElementById("depart-text");
  const returnDateText = document.getElementById("return-text");
  // const singleForecast = document.getElementById("single-forecast");

  /* ***** */
  const singleTemperature = document.getElementById("single-temperature");
  const singleDetails = document.getElementById("single-details");
  /* ***** */

  const minMax = document.getElementById("min-max");
  const humidity = document.getElementById("humidity");
  const wind = document.getElementById("wind");
  const daysLeft = document.getElementById("days-left");
  const multiForecast = document.getElementById("multi-forecast");

  // make result section visible
  resultSection.style.display = "grid";

  // updating core trip information in the UI
  let tripLengthString = "";
  if (tripData.duration < 1) tripLengthString = ` 1 day `;
  else tripLengthString = ` ${tripData.duration + 1} days `;
  tripDuration.innerHTML = tripLengthString;

  locationImage.setAttribute(
    "alt",
    `${tripData.city}, ${tripData.country} image`
  );
  locationImage.setAttribute("src", tripData.imgURL);

  resultSection.style.backgroundImage = `url('${tripData.imgURL}')`;

  cityName.innerHTML = tripData.city;
  countryName.innerHTML = tripData.country;
  departDateText.innerHTML = tripData.departure;
  returnDateText.innerHTML = tripData.return;
  daysLeft.innerHTML = ` ${Math.ceil(tripData.daysLeft)} `;

  // updating the UI based on tripData forecast
  if (tripData.forecast.length == 1) {
    multiForecast.style.display = "none";
    // singleForecast.style.display = "grid";
    singleTemperature.style.display = "block";
    singleDetails.style.display = "block";

    const dayForecast = tripData.forecast[0];

    const max = dayForecast.temperatureMax;
    const min = dayForecast.temperatureMin;
    minMax.innerHTML = `${min}/${max}`;

    humidity.innerHTML = dayForecast.humidity;
    wind.innerHTML = dayForecast.windSpeed + " kmph";
  } else {
    multiForecast.style.display = "grid";
    // singleForecast.style.display = "none";
    singleTemperature.style.display = "none";
    singleDetails.style.display = "none";

    multiForecast.innerHTML = "";

    const weekForecast = tripData.forecast;

    weekForecast.forEach(entry => {
      let time = entry.time;
      let dateFull = epochToDateString(time);
      let dateSliced = dateFull.slice(0, dateFull.length - 4);

      let min = entry.temperatureMin;
      let max = entry.temperatureMax;

      let html = `
          <div class="day-forecast">
            <div class="date">${dateSliced}</div>
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
    // let dateValue = new Date(departDateInput.value);
    let bodyData = {
      daysLeft: tripDatesData.daysLeft,
      lat: coordinatesData.geonames[0].lat,
      long: coordinatesData.geonames[0].lng,
      date: new Date(departDateInput.value)
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
  let departOn = new Date(departDateInput.value);
  let returnOn = new Date(returnDateInput.value);

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

export { calculateTripDates };

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
  setMinDate(departDateLabel, departDateInput, returnDateInput);
}

// Set the minimum date of the search-trip-date input field dynamically
// setMinDate(label, dateField)
function setMinDate(labelElement, departElement, returnElement) {
  // set date value to todays date
  const date = new Date();

  const dd = date.getDate();
  let mm = date.getMonth() + 1;
  if (mm < 10) {
    mm = "0" + mm;
  }
  const yyyy = date.getFullYear();

  const minDate = yyyy + "-" + mm + "-" + dd;

  // set minimum date value to todays date
  departElement.setAttribute("min", minDate);
  returnElement.setAttribute("min", minDate);
  // departElement.value = "2004-05-23";
  departElement.value = minDate;
  returnElement.value = minDate;

  // formatting the display date in a dd/mm/yyyy format
  const minDateDisp = `${date.getDate()}-${date.getMonth() +
    1}-${date.getFullYear()}`;

  // Update the HTML label placeholder
  const labelValue = `Date of Departure (after ${minDateDisp})`;
  labelElement.innerText = labelValue;
}

export { setMinDate };
