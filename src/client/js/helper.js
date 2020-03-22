// trim(1.0789, 2); => o/p: 1.07
function trim(number, precision = 2) {
  let array = number.toString().split(".");
  array.push(array.pop().substring(0, precision));
  let trimmedNumber = array.join(".");
  console.log(trimmedNumber);
  return Number(trimmedNumber);
}

export { trim };

// titleCase("I am tea pot"); => "I Am Tea Pot"
function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export { titleCase };

// Set the minimum date of the search-trip-date input field dynamically
// setMinDate(label, dateField)
const setMinDate = (labelElement, departElement, returnElement) => {
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
};

export { setMinDate };

// dateObjectToEpoch(date) =>

const dateToEpoch = date => {
  return Math.floor(date.getTime() / 1000.0);
};

export { dateToEpoch };

// epochToDateString(1585033200) => "24 Mar 2020"
const epochToDateString = epochDate => {
  let fullDate = new Date(epochDate * 1000);

  let monthList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  let date = fullDate.getDate(fullDate);
  let month = fullDate.getMonth(fullDate);
  let monthString = monthList[month];
  let year = fullDate.getFullYear(fullDate);

  let dateString = `${date} ${monthString} ${year}`;

  return dateString;
};

export { epochToDateString };

/* ~~~~~ DUMMY DATA ~~~~~ */

const dummyCoordinateJSON = {
  totalResultsCount: 1127,
  geonames: [
    {
      adminCode1: "02",
      lng: "11.57549",
      geonameId: 2867714,
      toponymName: "Munich",
      countryId: "2921044",
      fcl: "P",
      population: 1260391,
      countryCode: "DE",
      name: "Munich",
      fclName: "city, village,...",
      adminCodes1: {
        ISO3166_2: "BY"
      },
      countryName: "Germany",
      fcodeName: "seat of a first-order administrative division",
      adminName1: "Bavaria",
      lat: "48.13743",
      fcode: "PPLA"
    }
  ]
};

export { dummyCoordinateJSON };

const dummyImageJSON = {
  total: 7,
  totalHits: 7,
  hits: [
    {
      id: 4898432,
      pageURL:
        "https://pixabay.com/photos/winter-winter-forest-wintry-snow-4898432/",
      type: "photo",
      tags: "winter, winter forest, wintry",
      previewURL:
        "https://cdn.pixabay.com/photo/2020/03/03/11/36/winter-4898432_150.jpg",
      previewWidth: 100,
      previewHeight: 150,
      webformatURL:
        "https://pixabay.com/get/52e8dc4b4e51ae14f1dc8460c62d3177143cdde44e50744171267adc954dcc_640.jpg",
      webformatWidth: 427,
      webformatHeight: 640,
      largeImageURL:
        "https://pixabay.com/get/52e8dc4b4e51ae14f6da8c7dda2932781c3edde6524c704c7d2b72d59f4fc551_1280.jpg",
      imageWidth: 3648,
      imageHeight: 5472,
      imageSize: 5194951,
      views: 68,
      downloads: 52,
      favorites: 3,
      likes: 5,
      comments: 4,
      user_id: 10582885,
      user: "naturfreund_pics",
      userImageURL:
        "https://cdn.pixabay.com/user/2018/11/03/15-42-57-242_250x250.jpg"
    },
    {
      id: 4161615,
      pageURL:
        "https://pixabay.com/photos/cologne-germany-europe-travel-4161615/",
      type: "photo",
      tags: "cologne, germany, europe",
      previewURL:
        "https://cdn.pixabay.com/photo/2019/04/27/23/16/cologne-4161615_150.jpg",
      previewWidth: 100,
      previewHeight: 150,
      webformatURL:
        "https://pixabay.com/get/52e1d3424c53a914f1dc8460c62d3177143cdde44e50744171267adc954dcc_640.jpg",
      webformatWidth: 426,
      webformatHeight: 640,
      largeImageURL:
        "https://pixabay.com/get/52e1d3424c53a914f6da8c7dda2932781c3edde6524c704c7d2b72d59f4fc551_1280.jpg",
      imageWidth: 4000,
      imageHeight: 6000,
      imageSize: 10877245,
      views: 351,
      downloads: 175,
      favorites: 2,
      likes: 6,
      comments: 1,
      user_id: 12049839,
      user: "ValdasMiskinis",
      userImageURL:
        "https://cdn.pixabay.com/user/2020/01/04/20-28-22-654_250x250.jpg"
    },
    {
      id: 3932295,
      pageURL: "https://pixabay.com/photos/pirna-saxony-3932295/",
      type: "photo",
      tags: "pirna, saxony, elbe sandstone mountains",
      previewURL:
        "https://cdn.pixabay.com/photo/2019/01/14/14/37/pirna-3932295_150.jpg",
      previewWidth: 100,
      previewHeight: 150,
      webformatURL:
        "https://pixabay.com/get/55e9d641485ba914f1dc8460c62d3177143cdde44e50744171267adc954dcc_640.jpg",
      webformatWidth: 426,
      webformatHeight: 640,
      largeImageURL:
        "https://pixabay.com/get/55e9d641485ba914f6da8c7dda2932781c3edde6524c704c7d2b72d59f4fc551_1280.jpg",
      imageWidth: 3759,
      imageHeight: 5639,
      imageSize: 6172646,
      views: 325,
      downloads: 101,
      favorites: 1,
      likes: 3,
      comments: 0,
      user_id: 10881565,
      user: "pmwtastro",
      userImageURL:
        "https://cdn.pixabay.com/user/2018/12/10/18-30-45-300_250x250.jpg"
    }
  ],
  error: false,
  errorMessage: null
};

export { dummyImageJSON };
