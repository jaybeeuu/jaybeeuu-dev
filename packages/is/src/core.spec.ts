import { typeDescription } from "./core.js";
import { assert, isType, is } from "./index.js";
import type { TypeAssertion, TypePredicate } from "./index.js";

describe("assert", () => {
  it("throws when the candidate does not match the type guard.", () => {
    const assertIsString: TypeAssertion<string> = assert(is("string"));
    expect(() => {
      assertIsString(100);
    }).toThrow(new TypeError("Expected a string but got a number."));
  });

  it("doesn't throw when the candidate matches the type guard.", () => {
    const assertIsString: TypeAssertion<string> = assert(is("string"));
    expect(() => {
      assertIsString("100");
    }).not.toThrow();
  });
});

describe("isType", () => {
  it("returns a function that executes the function passed in.", () => {
    const predicate = (candidate: unknown): candidate is string => true;
    const isString = isType(predicate, "{description}");
    expect(isString("thing")).toBe(true);
  });
  it("attaches a description that matches the description passed in.", () => {
    const predicate = (candidate: unknown): candidate is string => true;
    const isString = isType(predicate, "{description}");
    expect(isString[typeDescription]).toBe("{description}");
  });

  describe("check", () => {
    it("check returns a typed value if the check passes.", () => {
      const isString = isType(
        (candidate: unknown): candidate is string =>
          typeof candidate === "string",
        "string",
      );
      expect(isString.check("this?")).toBe("this?");
    });

    it("check throws if the check failed.", () => {
      const isString = isType(
        (candidate: unknown): candidate is string =>
          typeof candidate === "string",
        "string",
      );
      expect(() => isString.check(10)).toThrow(
        "Expected a string but got a number.",
      );
    });
  });

  describe("assert", () => {
    it("assert returns if the check passes.", () => {
      const isString: TypePredicate<string> = isType(
        (candidate: unknown): candidate is string =>
          typeof candidate === "string",
        "string",
      );
      expect(() => {
        isString.assert("this?");
      }).not.toThrow();
    });

    it("assert throws if the check failed.", () => {
      const isString: TypePredicate<string> = isType(
        (candidate: unknown): candidate is string =>
          typeof candidate === "string",
        "string",
      );
      expect(() => {
        isString.assert(10);
      }).toThrow("Expected a string but got a number.");
    });
  });
});
