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
  console.log("Form submitted");

  // fetch all values submitted
  let destination = tripLocation.value;
  let departOn = new Date(departDate.value);
  let returnOn = new Date(returnDate.value);

  tripData.departure = epochToDateString(dateToEpoch(departOn));
  tripData.return = epochToDateString(dateToEpoch(returnOn));
  tripData.duration = Math.floor((returnOn - departOn) / (1000 * 3600 * 24));

  // calculate the difference in no. of days from today
  let today = new Date();
  let difference = (departOn - today) / (1000 * 3600 * 24);
  tripData = {
    ...tripData,
    daysLeft: difference
  };

  // error handling to make sure return date is after depart date
  if (returnOn < departOn) {
    handleError(2);
    return;
  }

  // getting coordinates of location
  let locationData = await getCoordinates(destination);
  console.log("~~~~~ geonames Location data returned ~~~~~");
  console.log(locationData);

  // dummy data for testing
  // let locationData = {
  //   error: false,
  //   city: "Paris",
  //   country: "France",
  //   lat: 51.50853,
  //   long: -0.12574
  // };

  // tripData = {
  //   ...tripData,
  //   city: locationData.city,
  //   country: locationData.country
  // };

  // error handling based on results returned
  if (locationData.error) {
    handleError(1);
    return;
  }

  // fetch weather based on departure date
  let forecast = {};
  if (difference < 7) {
    console.log("Present date - use Forecast Request");
    // forecast = await getPresentWeather(locationData);

    // for development
    forecast = { ...forecastPresent };
  } else {
    console.log("Future date - use Time Machine Request");
    // forecast = await getFutureWeather(locationData, departOn);

    // for development
    forecast = { ...forecastFuture };
  }

  tripData = { ...tripData, forecast: forecast.daily.data };

  // let url = await getLocationImage(tripData);
  let url = await getLocationImage(locationData);

  tripData = { ...tripData, imgURL: url };

  renderTripData(tripData);
}

async function getLocationImage(locationData) {
  let bodyData = { city: locationData.city, country: locationData.country };
  let imageData = await fetch("/get-image", {
    method: "post",
    body: JSON.stringify(bodyData),
    headers: { "Content-Type": "application/json" }
  });
  const imageJSON = await imageData.json();
  console.log("~~~~~ imageJSON RECIEVED ~~~~~");
  console.log(imageJSON);

  return imageJSON.hits[0].webformatURL;
}

async function getPresentWeather(data) {
  // const weatherData = await fetch(`/present-weather/${data.lat},${data.long}`);
  let bodyData = { lat: data.lat, long: data.long };
  let weatherData = await fetch(`/present-weather`, {
    method: "post",
    body: JSON.stringify(bodyData),
    headers: { "Content-Type": "application/json" }
  });
  const weatherJSON = await weatherData.json();
  console.log("~~~~~ 7 day weatherJSON RECIEVED ~~~~~");
  console.log(weatherJSON);

  return weatherJSON;
}

async function getFutureWeather(data, date) {
  console.log("In getFutureWeather()");
  // const weatherData = await fetch(`/present-weather/${data.lat},${data.long}`);
  let bodyData = { lat: data.lat, long: data.long, date: date };
  let weatherData = await fetch(`/future-weather`, {
    method: "post",
    body: JSON.stringify(bodyData),
    headers: { "Content-Type": "application/json" }
  });
  const weatherJSON = await weatherData.json();
  console.log("~~~~~ 1 day weatherJSON RECIEVED ~~~~~");
  console.log(weatherJSON);

  return weatherJSON;
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
  // console.log("~~~~~ location jsonData RECIEVED ~~~~~");
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
    case 2:
      error = "Return Date selected is before Depart Date ";
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

function renderTripData(tripData) {
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
  setMinDate(departDateLabel, departDate, returnDate);
}

export { handleUserURLInput };

let forecastPresent = {
  latitude: 37.8267,
  longitude: -122.4233,
  timezone: "America/Los_Angeles",
  currently: {
    time: 1584821390,
    summary: "Clear",
    icon: "clear-day",
    nearestStormDistance: 9,
    nearestStormBearing: 162,
    precipIntensity: 0,
    precipProbability: 0,
    temperature: 14.63,
    apparentTemperature: 14.63,
    dewPoint: 6.27,
    humidity: 0.57,
    pressure: 1020.6,
    windSpeed: 2.52,
    windGust: 3.92,
    windBearing: 130,
    cloudCover: 0.23,
    uvIndex: 5,
    visibility: 16.093,
    ozone: 370.7
  },
  daily: {
    summary: "Light rain on Tuesday.",
    icon: "rain",
    data: [
      {
        time: 1584774000,
        summary: "Clear throughout the day.",
        icon: "clear-day",
        sunriseTime: 1584799920,
        sunsetTime: 1584843840,
        moonPhase: 0.93,
        precipIntensity: 0.0168,
        precipIntensityMax: 0.0536,
        precipIntensityMaxTime: 1584824100,
        precipProbability: 0.24,
        precipType: "rain",
        temperatureHigh: 17.23,
        temperatureHighTime: 1584832080,
        temperatureLow: 8.81,
        temperatureLowTime: 1584887640,
        apparentTemperatureHigh: 16.95,
        apparentTemperatureHighTime: 1584832080,
        apparentTemperatureLow: 7.87,
        apparentTemperatureLowTime: 1584888120,
        dewPoint: 5.93,
        humidity: 0.65,
        pressure: 1020.7,
        windSpeed: 2.18,
        windGust: 4.56,
        windGustTime: 1584845100,
        windBearing: 310,
        cloudCover: 0.15,
        uvIndex: 5,
        uvIndexTime: 1584822060,
        visibility: 16.093,
        ozone: 370.1,
        temperatureMin: 9.41,
        temperatureMinTime: 1584798840,
        temperatureMax: 17.23,
        temperatureMaxTime: 1584832080,
        apparentTemperatureMin: 8.54,
        apparentTemperatureMinTime: 1584796320,
        apparentTemperatureMax: 16.95,
        apparentTemperatureMaxTime: 1584832080
      },
      {
        time: 1584860400,
        summary: "Partly cloudy throughout the day.",
        icon: "partly-cloudy-day",
        sunriseTime: 1584886200,
        sunsetTime: 1584930300,
        moonPhase: 0.96,
        precipIntensity: 0.0143,
        precipIntensityMax: 0.0426,
        precipIntensityMaxTime: 1584866880,
        precipProbability: 0.28,
        precipType: "rain",
        temperatureHigh: 17.51,
        temperatureHighTime: 1584915960,
        temperatureLow: 9.11,
        temperatureLowTime: 1584975360,
        apparentTemperatureHigh: 17.23,
        apparentTemperatureHighTime: 1584915960,
        apparentTemperatureLow: 7.22,
        apparentTemperatureLowTime: 1584975600,
        dewPoint: 6.37,
        humidity: 0.66,
        pressure: 1017.9,
        windSpeed: 2.19,
        windGust: 5.31,
        windGustTime: 1584899340,
        windBearing: 11,
        cloudCover: 0.37,
        uvIndex: 4,
        uvIndexTime: 1584908280,
        visibility: 16.093,
        ozone: 374.3,
        temperatureMin: 8.81,
        temperatureMinTime: 1584887640,
        temperatureMax: 17.51,
        temperatureMaxTime: 1584915960,
        apparentTemperatureMin: 7.87,
        apparentTemperatureMinTime: 1584888120,
        apparentTemperatureMax: 17.23,
        apparentTemperatureMaxTime: 1584915960
      },
      {
        time: 1584946800,
        summary: "Mostly cloudy throughout the day.",
        icon: "partly-cloudy-day",
        sunriseTime: 1584972540,
        sunsetTime: 1585016760,
        moonPhase: 0.99,
        precipIntensity: 0.0085,
        precipIntensityMax: 0.0529,
        precipIntensityMaxTime: 1585033200,
        precipProbability: 0.19,
        precipType: "rain",
        temperatureHigh: 11.94,
        temperatureHighTime: 1585001280,
        temperatureLow: 9.49,
        temperatureLowTime: 1585052100,
        apparentTemperatureHigh: 11.66,
        apparentTemperatureHighTime: 1585001280,
        apparentTemperatureLow: 8.29,
        apparentTemperatureLowTime: 1585045440,
        dewPoint: 5.27,
        humidity: 0.7,
        pressure: 1018.2,
        windSpeed: 4.31,
        windGust: 7.08,
        windGustTime: 1585006200,
        windBearing: 259,
        cloudCover: 0.69,
        uvIndex: 4,
        uvIndexTime: 1584995580,
        visibility: 16.093,
        ozone: 335.5,
        temperatureMin: 9.11,
        temperatureMinTime: 1584975360,
        temperatureMax: 12.39,
        temperatureMaxTime: 1584946800,
        apparentTemperatureMin: 7.21,
        apparentTemperatureMinTime: 1584976260,
        apparentTemperatureMax: 12.11,
        apparentTemperatureMaxTime: 1584946800
      },
      {
        time: 1585033200,
        summary: "Light rain throughout the day.",
        icon: "rain",
        sunriseTime: 1585058820,
        sunsetTime: 1585103220,
        moonPhase: 0.02,
        precipIntensity: 0.2881,
        precipIntensityMax: 0.5504,
        precipIntensityMaxTime: 1585093920,
        precipProbability: 0.87,
        precipType: "rain",
        temperatureHigh: 11.97,
        temperatureHighTime: 1585097400,
        temperatureLow: 7.76,
        temperatureLowTime: 1585147080,
        apparentTemperatureHigh: 11.69,
        apparentTemperatureHighTime: 1585097400,
        apparentTemperatureLow: 7.11,
        apparentTemperatureLowTime: 1585147560,
        dewPoint: 4.32,
        humidity: 0.67,
        pressure: 1019,
        windSpeed: 3.44,
        windGust: 6.65,
        windGustTime: 1585098900,
        windBearing: 238,
        cloudCover: 0.69,
        uvIndex: 4,
        uvIndexTime: 1585082340,
        visibility: 15.976,
        ozone: 364.8,
        temperatureMin: 8.97,
        temperatureMinTime: 1585119600,
        temperatureMax: 11.97,
        temperatureMaxTime: 1585097400,
        apparentTemperatureMin: 7.74,
        apparentTemperatureMinTime: 1585119600,
        apparentTemperatureMax: 11.69,
        apparentTemperatureMaxTime: 1585097400
      },
      {
        time: 1585119600,
        summary: "Clear throughout the day.",
        icon: "clear-day",
        sunriseTime: 1585145100,
        sunsetTime: 1585189680,
        moonPhase: 0.05,
        precipIntensity: 0.0354,
        precipIntensityMax: 0.2995,
        precipIntensityMaxTime: 1585127040,
        precipProbability: 0.32,
        precipType: "rain",
        temperatureHigh: 12.85,
        temperatureHighTime: 1585173660,
        temperatureLow: 6.08,
        temperatureLowTime: 1585232640,
        apparentTemperatureHigh: 12.57,
        apparentTemperatureHighTime: 1585173660,
        apparentTemperatureLow: 4.79,
        apparentTemperatureLowTime: 1585230720,
        dewPoint: 1.96,
        humidity: 0.59,
        pressure: 1017.9,
        windSpeed: 3.76,
        windGust: 9.44,
        windGustTime: 1585189680,
        windBearing: 295,
        cloudCover: 0.06,
        uvIndex: 5,
        uvIndexTime: 1585167240,
        visibility: 16.093,
        ozone: 384.5,
        temperatureMin: 7.76,
        temperatureMinTime: 1585147080,
        temperatureMax: 12.85,
        temperatureMaxTime: 1585173660,
        apparentTemperatureMin: 6.24,
        apparentTemperatureMinTime: 1585206000,
        apparentTemperatureMax: 12.57,
        apparentTemperatureMaxTime: 1585173660
      },
      {
        time: 1585206000,
        summary: "Clear throughout the day.",
        icon: "clear-day",
        sunriseTime: 1585231440,
        sunsetTime: 1585276140,
        moonPhase: 0.08,
        precipIntensity: 0.004,
        precipIntensityMax: 0.0094,
        precipIntensityMaxTime: 1585292400,
        precipProbability: 0.09,
        precipType: "rain",
        temperatureHigh: 14.31,
        temperatureHighTime: 1585263720,
        temperatureLow: 8.13,
        temperatureLowTime: 1585317300,
        apparentTemperatureHigh: 14.03,
        apparentTemperatureHighTime: 1585263720,
        apparentTemperatureLow: 6.41,
        apparentTemperatureLowTime: 1585316700,
        dewPoint: 1.74,
        humidity: 0.58,
        pressure: 1017.5,
        windSpeed: 4.01,
        windGust: 8.3,
        windGustTime: 1585206000,
        windBearing: 300,
        cloudCover: 0.01,
        uvIndex: 6,
        uvIndexTime: 1585253820,
        visibility: 16.093,
        ozone: 359.3,
        temperatureMin: 6.08,
        temperatureMinTime: 1585232640,
        temperatureMax: 14.31,
        temperatureMaxTime: 1585263720,
        apparentTemperatureMin: 4.79,
        apparentTemperatureMinTime: 1585230720,
        apparentTemperatureMax: 14.03,
        apparentTemperatureMaxTime: 1585263720
      },
      {
        time: 1585292400,
        summary: "Mostly cloudy throughout the day.",
        icon: "partly-cloudy-day",
        sunriseTime: 1585317720,
        sunsetTime: 1585362600,
        moonPhase: 0.11,
        precipIntensity: 0.0025,
        precipIntensityMax: 0.0105,
        precipIntensityMaxTime: 1585296000,
        precipProbability: 0.05,
        precipType: "rain",
        temperatureHigh: 13.31,
        temperatureHighTime: 1585346640,
        temperatureLow: 8.13,
        temperatureLowTime: 1585405200,
        apparentTemperatureHigh: 13.03,
        apparentTemperatureHighTime: 1585346640,
        apparentTemperatureLow: 7.39,
        apparentTemperatureLowTime: 1585404000,
        dewPoint: 3.49,
        humidity: 0.63,
        pressure: 1023.5,
        windSpeed: 4.11,
        windGust: 6.96,
        windGustTime: 1585353120,
        windBearing: 288,
        cloudCover: 0.44,
        uvIndex: 4,
        uvIndexTime: 1585336020,
        visibility: 16.093,
        ozone: 333.3,
        temperatureMin: 8.13,
        temperatureMinTime: 1585317300,
        temperatureMax: 13.31,
        temperatureMaxTime: 1585346640,
        apparentTemperatureMin: 6.41,
        apparentTemperatureMinTime: 1585316700,
        apparentTemperatureMax: 13.03,
        apparentTemperatureMaxTime: 1585346640
      },
      {
        time: 1585378800,
        summary: "Clear throughout the day.",
        icon: "clear-day",
        sunriseTime: 1585404060,
        sunsetTime: 1585449000,
        moonPhase: 0.15,
        precipIntensity: 0.0046,
        precipIntensityMax: 0.0095,
        precipIntensityMaxTime: 1585413000,
        precipProbability: 0.07,
        precipType: "rain",
        temperatureHigh: 16.45,
        temperatureHighTime: 1585433520,
        temperatureLow: 9.52,
        temperatureLowTime: 1585491600,
        apparentTemperatureHigh: 16.17,
        apparentTemperatureHighTime: 1585433520,
        apparentTemperatureLow: 9.79,
        apparentTemperatureLowTime: 1585491600,
        dewPoint: 4.97,
        humidity: 0.65,
        pressure: 1024.3,
        windSpeed: 3.05,
        windGust: 7.07,
        windGustTime: 1585448160,
        windBearing: 303,
        cloudCover: 0.02,
        uvIndex: 7,
        uvIndexTime: 1585426320,
        visibility: 16.093,
        ozone: 340.1,
        temperatureMin: 8.13,
        temperatureMinTime: 1585405200,
        temperatureMax: 16.45,
        temperatureMaxTime: 1585433520,
        apparentTemperatureMin: 7.39,
        apparentTemperatureMinTime: 1585404000,
        apparentTemperatureMax: 16.17,
        apparentTemperatureMaxTime: 1585433520
      }
    ]
  },
  alerts: [
    {
      title: "Beach Hazards Statement",
      regions: [
        "Coastal North Bay Including Point Reyes National Seashore",
        "Northern Monterey Bay",
        "San Francisco",
        "San Francisco Peninsula Coast",
        "San Fransisco Peninsula Coast",
        "Southern Monterey Bay and Big Sur Coast"
      ],
      severity: "warning",
      time: 1584846000,
      expires: 1584957600,
      description:
        "...Increased Risk of Sneaker Waves and Rip Currents from this Evening until late Sunday Night... .A long period northwest swell will move into the coastal waters this evening increasing the risk of sneaker waves and rip currents along the coastline from Sonoma County through Monterey County. The greatest risk for sneaker waves will occur Saturday evening through Sunday morning. Northwest swell of 2 to 5 feet at 18 to 21 seconds is anticipated. Swell periods will gradually decrease Sunday night and Monday. ...BEACH HAZARDS STATEMENT REMAINS IN EFFECT FROM 8 PM PDT THIS EVENING THROUGH LATE SUNDAY NIGHT... * WHAT...Increased risk of sneaker waves and rip currents are expected. * WHERE...Coastal North Bay Including Point Reyes National Seashore, Southern Monterey Bay and Big Sur Coast, San Francisco Peninsula Coast, San Francisco and Northern Monterey Bay Counties. * WHEN...From 8 PM PDT this evening through late Sunday night. * IMPACTS...Sneaker waves can knock unsuspecting beach goers over and into the sea. Rip currents can pull swimmers and surfers out to sea. * ADDITIONAL DETAILS...Steep beaches will have a higher risk of sneaker wave and rip current activity with greater wave run-up onto beaches.\n",
      uri:
        "https://alerts.weather.gov/cap/wwacapget.php?x=CA125F40F77E8C.BeachHazardsStatement.125F41152D60CA.MTRCFWMTR.9d1f6acb9dca5e256fc7581df00a2ad7"
    }
  ],
  offset: -7
};

let forecastFuture = {
  latitude: 51.50853,
  longitude: -0.12574,
  timezone: "Europe/London",
  currently: {
    time: 1585872000,
    temperature: 8.09,
    temperatureError: 3.11,
    apparentTemperature: 6.23,
    dewPoint: 3.56,
    dewPointError: 3.68,
    humidity: 0.73,
    pressure: 1014.6,
    pressureError: 11,
    windSpeed: 2.98,
    windSpeedError: 1.73,
    windBearing: 97,
    windBearingError: 30,
    cloudCover: 0.63,
    cloudCoverError: 0.32,
    uvIndex: 0
  },
  daily: {
    data: [
      {
        time: 1585868400,
        sunriseTime: 1585891860,
        sunsetTime: 1585939080,
        moonPhase: 0.34,
        temperatureHigh: 12.11,
        temperatureHighError: 3.11,
        temperatureHighTime: 1585924260,
        temperatureLow: 6.89,
        temperatureLowError: 3.11,
        temperatureLowTime: 1585975380,
        apparentTemperatureHigh: 11.83,
        apparentTemperatureHighTime: 1585924260,
        apparentTemperatureLow: 5.25,
        apparentTemperatureLowTime: 1585975500,
        dewPoint: 3.41,
        dewPointError: 3.67,
        humidity: 0.67,
        pressure: 1014.3,
        pressureError: 11,
        windSpeed: 3.22,
        windSpeedError: 1.73,
        windBearing: 94,
        windBearingError: 29,
        cloudCover: 0.69,
        cloudCoverError: 0.32,
        uvIndex: 4,
        uvIndexTime: 1585915380,
        temperatureMin: 6.8,
        temperatureMinError: 3.11,
        temperatureMinTime: 1585889040,
        temperatureMax: 12.11,
        temperatureMaxError: 3.11,
        temperatureMaxTime: 1585924260,
        apparentTemperatureMin: 5.15,
        apparentTemperatureMinTime: 1585889100,
        apparentTemperatureMax: 11.83,
        apparentTemperatureMaxTime: 1585924260
      }
    ]
  },
  offset: 1
};
