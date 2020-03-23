// import { geonamesQuery } from "./server";
// const geonamesQuery = require("./server");

const regeneratorRuntime = require("regenerator-runtime");

function geonamesQuery(locationString) {
  console.log(`In geonamesQuery(locationString)`);
  // http://api.geonames.org/searchJSON?q=london&maxRows=1&username=coderapex
  const startString = "http://api.geonames.org/searchJSON?q=";
  const endString = "&maxRows=1&username=coderapex";

  // removing empty spaces from the query string
  locationString = locationString.replace(/\s/g, "%20");

  // setting final query string to call
  const queryString = startString + locationString + endString;

  console.log(`🚀: geonamesQuery -> queryString`, queryString);
  return queryString;
}

test("it should be a function", () => {
  expect(typeof geonamesQuery("london")).toEqual("string");
});
