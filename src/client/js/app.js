// Requirement
// - HTML form - enter location and date
// --  If trip is within a week, print current weather forecast
// --  Else, print predicted weather forecast

// Steps
// - Get coordinates of location using Geonames API
// - Get the weather of the coordinates from Dark Sky API
// - Get image of location from Pixabay API

import { trim, dateToEpoch, setMinDate, epochToDateString } from "./helper";
import { dummyCoordinateJSON, dummyImageJSON } from "./helper";

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
  console.log("In handleSubmit()");
  e.preventDefault();

  try {
    const tripDatesData = calculateTripDates();
    // console.log(`🚀: handleSubmit -> tripDatesData`, tripDatesData);

    // fetch coordinates - production ready
    // const coordinatesData = await getCoordinates(tripLocation.value);
    // for development
    const coordinatesData = dummyCoordinateJSON;
    // console.log(`🚀: handleSubmit -> coordinatesData`, coordinatesData);

    // production ready - fetch image of location
    // const imageData = await getImageData(coordinatesData);
    // for development
    const imageData = dummyImageJSON;
    // console.log(`🚀: handleSubmit -> imageData`, imageData);

    // const forecastData = await getForecastData(coordinatesData);
    // console.log(`🚀: handleSubmit -> forecastData`, forecastData);
  } catch (error) {
    console.log("Error Occured:");
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

// async function getForecastData(coordinatesData) {
//   console.log("- In getForecastData(coordinatesData)");

//   try {
//     let bodyData = { lat: data.lat, long: data.long, date: date };
//     let weatherData = await fetch(`/future-weather`, {
//       method: "post",
//       body: JSON.stringify(bodyData),
//       headers: { "Content-Type": "application/json" }
//     });
//     const weatherJSON = await weatherData.json();
//     console.log("~~~~~ 1 day weatherJSON RECIEVED ~~~~~");
//     console.log(weatherJSON);

//     console.log("- Exiting getForecastData(coordinatesData)");

//     return weatherJSON;
//   } catch (error) {
//     console.log("Error Occurred:");
//     console.log(error);
//   }
// }

function handleReset(e) {
  e.preventDefault();
  console.log("In handleReset()");

  tripLocation.value = "";
  setMinDate(departDateLabel, departDate, returnDate);
}

// const dummyCoordinateJSON = {
//   totalResultsCount: 1127,
//   geonames: [
//     {
//       adminCode1: "02",
//       lng: "11.57549",
//       geonameId: 2867714,
//       toponymName: "Munich",
//       countryId: "2921044",
//       fcl: "P",
//       population: 1260391,
//       countryCode: "DE",
//       name: "Munich",
//       fclName: "city, village,...",
//       adminCodes1: {
//         ISO3166_2: "BY"
//       },
//       countryName: "Germany",
//       fcodeName: "seat of a first-order administrative division",
//       adminName1: "Bavaria",
//       lat: "48.13743",
//       fcode: "PPLA"
//     }
//   ]
// };

// const dummyImageJSON = {
//   total: 7,
//   totalHits: 7,
//   hits: [
//     {
//       id: 4898432,
//       pageURL:
//         "https://pixabay.com/photos/winter-winter-forest-wintry-snow-4898432/",
//       type: "photo",
//       tags: "winter, winter forest, wintry",
//       previewURL:
//         "https://cdn.pixabay.com/photo/2020/03/03/11/36/winter-4898432_150.jpg",
//       previewWidth: 100,
//       previewHeight: 150,
//       webformatURL:
//         "https://pixabay.com/get/52e8dc4b4e51ae14f1dc8460c62d3177143cdde44e50744171267adc954dcc_640.jpg",
//       webformatWidth: 427,
//       webformatHeight: 640,
//       largeImageURL:
//         "https://pixabay.com/get/52e8dc4b4e51ae14f6da8c7dda2932781c3edde6524c704c7d2b72d59f4fc551_1280.jpg",
//       imageWidth: 3648,
//       imageHeight: 5472,
//       imageSize: 5194951,
//       views: 68,
//       downloads: 52,
//       favorites: 3,
//       likes: 5,
//       comments: 4,
//       user_id: 10582885,
//       user: "naturfreund_pics",
//       userImageURL:
//         "https://cdn.pixabay.com/user/2018/11/03/15-42-57-242_250x250.jpg"
//     },
//     {
//       id: 4161615,
//       pageURL:
//         "https://pixabay.com/photos/cologne-germany-europe-travel-4161615/",
//       type: "photo",
//       tags: "cologne, germany, europe",
//       previewURL:
//         "https://cdn.pixabay.com/photo/2019/04/27/23/16/cologne-4161615_150.jpg",
//       previewWidth: 100,
//       previewHeight: 150,
//       webformatURL:
//         "https://pixabay.com/get/52e1d3424c53a914f1dc8460c62d3177143cdde44e50744171267adc954dcc_640.jpg",
//       webformatWidth: 426,
//       webformatHeight: 640,
//       largeImageURL:
//         "https://pixabay.com/get/52e1d3424c53a914f6da8c7dda2932781c3edde6524c704c7d2b72d59f4fc551_1280.jpg",
//       imageWidth: 4000,
//       imageHeight: 6000,
//       imageSize: 10877245,
//       views: 351,
//       downloads: 175,
//       favorites: 2,
//       likes: 6,
//       comments: 1,
//       user_id: 12049839,
//       user: "ValdasMiskinis",
//       userImageURL:
//         "https://cdn.pixabay.com/user/2020/01/04/20-28-22-654_250x250.jpg"
//     },
//     {
//       id: 3932295,
//       pageURL: "https://pixabay.com/photos/pirna-saxony-3932295/",
//       type: "photo",
//       tags: "pirna, saxony, elbe sandstone mountains",
//       previewURL:
//         "https://cdn.pixabay.com/photo/2019/01/14/14/37/pirna-3932295_150.jpg",
//       previewWidth: 100,
//       previewHeight: 150,
//       webformatURL:
//         "https://pixabay.com/get/55e9d641485ba914f1dc8460c62d3177143cdde44e50744171267adc954dcc_640.jpg",
//       webformatWidth: 426,
//       webformatHeight: 640,
//       largeImageURL:
//         "https://pixabay.com/get/55e9d641485ba914f6da8c7dda2932781c3edde6524c704c7d2b72d59f4fc551_1280.jpg",
//       imageWidth: 3759,
//       imageHeight: 5639,
//       imageSize: 6172646,
//       views: 325,
//       downloads: 101,
//       favorites: 1,
//       likes: 3,
//       comments: 0,
//       user_id: 10881565,
//       user: "pmwtastro",
//       userImageURL:
//         "https://cdn.pixabay.com/user/2018/12/10/18-30-45-300_250x250.jpg"
//     }
//   ],
//   error: false,
//   errorMessage: null
// };
