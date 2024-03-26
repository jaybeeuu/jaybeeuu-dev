import type { TypePredicate } from "./core";
import { isType, typeDescription } from "./core";

describe("isType", () => {
  it("returns a function that executes the function passed in.", () => {
    const predicate = (candidate: unknown): candidate is string => true;
    const is = isType(predicate, "{description}");
    expect(is("thing")).toBe(true);
  });
  it("attaches a description that matches the description passed in.", () => {
    const predicate = (candidate: unknown): candidate is string => true;
    const is = isType(predicate, "{description}");
    expect(is[typeDescription]).toBe("{description}");
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
