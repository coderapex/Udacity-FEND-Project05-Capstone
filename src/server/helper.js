const darkSkyQuery = (lat, long) => {
  // https://api.darksky.net/forecast/[key]/[latitude],[longitude]&exclude=minutely,hourly,flags&units=si
  const key = "138476a80ce39e46213c3fe7c71ce908";

  const startString = "https://api.darksky.net/forecast/";
  const endString = "?&exclude=minutely,hourly,flags&units=si";

  const queryString = startString + key + "/" + lat + "," + long + endString;
  // console.log(queryString);

  return queryString;
};

export { darkSkyQuery };
