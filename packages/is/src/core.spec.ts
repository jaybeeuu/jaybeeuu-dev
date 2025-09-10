import type {
  TypeAssertion,
  TypePredicate,
  ValidationContext,
  ValidationResult,
} from "./core.js";
import { assert, failValidation, isType, passValidation } from "./core.js";
import { describe, expect, it } from "@jest/globals";

describe("assert", () => {
  it("throws when the candidate does not match the type guard.", () => {
    const assertPredicate: TypeAssertion<unknown> = assert(
      isType(
        (candidate: unknown, context: ValidationContext): ValidationResult =>
          failValidation("Whoops!", context),
        "string",
      ),
    );
    expect(() => {
      assertPredicate(100);
    }).toThrow(
      new TypeError("Expected string but received number.\nroot: Whoops!"),
    );
  });

  it("doesn't throw when the candidate matches the type guard.", () => {
    const assertPredicate: TypeAssertion<unknown> = assert(
      isType(
        (candidate: unknown, context: ValidationContext): ValidationResult =>
          passValidation(context),
        "string",
      ),
    );
    expect(() => {
      assertPredicate("100");
    }).not.toThrow();
  });
});

describe("isType", () => {
  it("returns a function that returns true when validation passes.", () => {
    const predicate = isType(
      (candidate: unknown, context: ValidationContext): ValidationResult =>
        passValidation(context),
      "{description}",
    );
    expect(predicate("thing")).toBe(true);
  });
  it("returns a function that returns true when validation fails.", () => {
    const predicate = isType(
      (candidate: unknown, context: ValidationContext): ValidationResult =>
        failValidation("Whoops!", context),
      "{description}",
    );
    expect(predicate("thing")).toBe(false);
  });

  it("attaches a description that matches the description passed in.", () => {
    const predicate = isType(
      (candidate: unknown, context: ValidationContext): ValidationResult =>
        failValidation("Whoops!", context),
      "{description}",
    );
    expect(predicate.typeDescription).toBe("{description}");
  });

  describe("check", () => {
    it("check returns a typed value if the check passes.", () => {
      const predicate = isType(
        (candidate: unknown, context: ValidationContext): ValidationResult =>
          passValidation(context),
        "{description}",
      );

      expect(predicate.check("this?")).toBe("this?");
    });

    it("check throws if the check failed.", () => {
      const predicate = isType(
        (candidate: unknown, context: ValidationContext): ValidationResult =>
          failValidation("Whoops!", context),
        "{description}",
      );

      expect(() => predicate.check(10)).toThrow(
        "Expected {description} but received number.\nroot: Whoops!",
      );
    });
  });

  describe("assert", () => {
    it("assert returns if the check passes.", () => {
      const predicate: TypePredicate<string> = isType(
        (candidate: unknown, context: ValidationContext): ValidationResult =>
          passValidation(context),
        "string",
      );
      expect(() => {
        predicate.assert("this?");
      }).not.toThrow();
    });

    it("assert throws if the check failed.", () => {
      const predicate: TypePredicate<string> = isType(
        (candidate: unknown, context: ValidationContext): ValidationResult =>
          failValidation("Expected a string but got a number.", context),
        "string",
      );
      expect(() => {
        predicate.assert(10);
      }).toThrow(
        "Expected string but received number.\nroot: Expected a string but got a number.",
      );
    });
  });

  describe("validate", () => {
    it("validate returns a ValidationPassed if the check passes.", () => {
      const predicate: TypePredicate<string> = isType(
        (candidate: unknown, context: ValidationContext): ValidationResult =>
          passValidation(context),
        "string",
      );
      expect(predicate.validate("this?")).toStrictEqual({ valid: true });
    });

    it("assert throws if the check failed.", () => {
      const predicate: TypePredicate<string> = isType(
        (candidate: unknown, context: ValidationContext): ValidationResult =>
          failValidation("Expected a string but got a number.", context),
        "string",
      );
      expect(predicate.validate("this?")).toStrictEqual({
        valid: false,
        errorMessages: ["root: Expected a string but got a number."],
      });
    });
  });
});
