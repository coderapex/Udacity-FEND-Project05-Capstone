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
const setMinDate = (labelElement, dateElement) => {
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
  dateElement.setAttribute("min", minDate);
  // dateElement.value = "2004-05-23";
  dateElement.value = minDate;

  // formatting the display date in a dd/mm/yyyy format
  const minDateDisp = `${date.getDate()}-${date.getMonth() +
    1}-${date.getFullYear()}`;

  // Update the HTML label placeholder
  const labelValue = `Date of Departure (after ${minDateDisp})`;
  labelElement.innerText = labelValue;
};

export { setMinDate };

// epochToDateString(1585033200)
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
