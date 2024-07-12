import { conv } from "./index.js";
import { env } from "node:process";
import { describe, expect, it, jest } from "@jest/globals";

jest.mock("dotenv");

describe("conv", () => {
  it("throws if is a mandatory variable is not present.", () => {
    delete env.THING;
    expect(() => conv({ THING: { type: "string" } })).toThrow(
      new TypeError(
        `Expected environment variable THING to be defined, but it was "undefined".`
      )
    );
  });

  it("makes a mandatory variable available.", () => {
    env.THING = "{thing}";
    const vars = conv({ THING: { optional: false } });
    expect(vars.THING).toBe("{thing}");
  });

  it("sets a variable with a default value to the default if it is missing.", () => {
    delete env.THING;
    const vars = conv({ THING: { default: "{default}" } });
    expect(vars.THING).toBe("{default}");
  });

  it("sets a variable with a default to the supplied value if it is present.", () => {
    env.THING = "{thing}";
    const vars = conv({ THING: { default: "{default}" } });
    expect(vars.THING).toBe("{thing}");
  });

  it("makes an optional variable available if it is present.", () => {
    env.THING = "{thing}";
    const vars = conv({ THING: { type: "string", optional: true } });
    expect(vars.THING).toBe("{thing}");
  });

  it("does not throw if an optional variable is not present.", () => {
    delete env.THING;
    const vars = conv({ THING: { type: "string", optional: true } });
    expect(vars.THING).toBeNull();
  });

  describe("number", () => {
    it("throws if the variable value is not a number.", () => {
      env.THING = "{thing}";
      expect(() => conv({ THING: { type: "number" } })).toThrow(
        'Expected THING to be a valid number, but received "{thing}".'
      );
    });

    it("returns the value converted to a number, if it is a valid number.", () => {
      env.THING = "123.4";
      expect(conv({ THING: { type: "number" } }).THING).toBe(123.4);
    });
  });

  describe("boolean", () => {
    it('throws if the variable value is not "true" or "false".', () => {
      env.THING = "{thing}";
      expect(() => conv({ THING: { type: "boolean" } })).toThrow(
        'Expected THING to be either "true" or "false", but received "{thing}".'
      );
    });

    it.each([
      { value: "true", expectedResult: true },
      { value: "True", expectedResult: true },
      { value: "TRUE", expectedResult: true },
      { value: "TrUe", expectedResult: true },
      { value: "false", expectedResult: false },
      { value: "False", expectedResult: false },
      { value: "FALSE", expectedResult: false },
      { value: "FaLsE", expectedResult: false },
    ])(
      "$#: converts $value to $expectedResult.",
      ({ value, expectedResult }) => {
        env.THING = value;
        expect(conv({ THING: { type: "boolean" } }).THING).toBe(expectedResult);
      }
    );
  });

  describe("date", () => {
    it("throws if the variable value is not a valid date.", () => {
      env.THING = "{not a date}";
      expect(() => conv({ THING: { type: "date" } })).toThrow(
        'Expected THING to be a valid date or date/time, but received "{not a date}".'
      );
    });

    it.each([
      { value: "2024-03-01", expectedResult: new Date("2024-03-01") },
      { value: "01/03/2024", expectedResult: new Date("2024-01-03") },
      {
        value: "2024-03-01T12:34:56.789Z",
        expectedResult: new Date("2024-03-01T12:34:56.789Z"),
      },
    ])(
      "$#: converts $value to $expectedResult.",
      ({ value, expectedResult }) => {
        env.THING = value;
        expect(conv({ THING: { type: "date" } }).THING).toStrictEqual(
          expectedResult
        );
      }
    );
  });

  describe("types", () => {
    it("is able to resolve the type of the value only from the default property.", () => {
      delete env.THING;
      const vars = conv({ THING: { default: 123 } });
      const value: number = vars.THING;
      expect(value).toBe(123);
    });

    it("is able to resolve the type of the value only from the type property.", () => {
      env.THING = "true";
      const vars = conv({ THING: { type: "boolean" } });
      const value: boolean = vars.THING;
      expect(value).toBe(true);
    });

    it("defaults the type of the variable to string, when only passed optional (true).", () => {
      env.THING = "{thing}";
      const vars = conv({ THING: { optional: false } });
      const value: string = vars.THING;
      expect(value).toBe("{thing}");
    });

    it("defaults the type of a variable to string, when passed only optional (false).", () => {
      env.THING = "{thing}";
      const vars = conv({ THING: { optional: true } });
      const value: string | null = vars.THING;
      expect(value).toBe("{thing}");
    });
  });
});
