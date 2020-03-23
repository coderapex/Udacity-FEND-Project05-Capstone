import { geonamesQuery } from "./server";

const regeneratorRuntime = require("regenerator-runtime");

test("it should be a function", () => {
  expect(typeof geonamesQuery("london")).toEqual("string");
});
