import type {
  TypeAssertion,
  TypePredicate,
  ValidationContext,
  ValidationResult,
} from "./core.js";
import { assert, failValidation, isType, passValidation } from "./core.js";
import { describe, expect, it } from "@jest/globals";
import { is } from "./index.js";

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

  describe("optional", () => {
    it("returns a TypePredicate that accepts the original type", () => {
      const optionalStringPredicate = is("string").optional();
      expect(optionalStringPredicate("hello")).toBe(true);
    });

    it("returns a TypePredicate that accepts undefined", () => {
      const optionalStringPredicate = is("string").optional();
      expect(optionalStringPredicate(undefined)).toBe(true);
    });

    it.each([42, null, {}])(
      "%#: returns a TypePredicate that rejects invalid type: %p",
      (value) => {
        const optionalStringPredicate = is("string").optional();

        expect(optionalStringPredicate(value)).toBe(false);
      },
    );

    it("has the correct type description", () => {
      const optionalStringPredicate = is("string").optional();

      expect(optionalStringPredicate.typeDescription).toBe(
        "string | undefined",
      );
    });

    it("check method returns the original value for valid input", () => {
      const optionalStringPredicate = is("string").optional();

      expect(optionalStringPredicate.check("hello")).toBe("hello");
    });

    it("check method returns undefined for undefined input", () => {
      const optionalStringPredicate = is("string").optional();

      expect(optionalStringPredicate.check(undefined)).toBe(undefined);
    });

    it("check method throws for invalid input", () => {
      const optionalStringPredicate = is("string").optional();

      expect(() => optionalStringPredicate.check(42)).toThrow(
        'Expected string | undefined but received number.\nroot: Expected "string", but received "number"',
      );
    });

    it.each(["hello", undefined])(
      "%# assert method works for valid input (%p)",
      (value) => {
        const optionalStringPredicate: TypePredicate<string | undefined> =
          is("string").optional();
        expect(() => {
          optionalStringPredicate.assert(value);
        }).not.toThrow();
      },
    );

    it("assert method throws for invalid input", () => {
      const optionalStringPredicate: TypePredicate<string | undefined> =
        is("string").optional();
      expect(() => {
        optionalStringPredicate.assert(null);
      }).toThrow();
    });

    it.each(["hello", undefined])(
      "%# validate method returns success for valid values (%p)",
      (value) => {
        const optionalStringPredicate: TypePredicate<string | undefined> =
          is("string").optional();

        expect(optionalStringPredicate.validate(value)).toStrictEqual({
          valid: true,
        });
      },
    );

    it("validate method returns failure for invalid values", () => {
      const stringPredicate: TypePredicate<string> = is("string");
      const optionalStringPredicate = stringPredicate.optional();

      expect(optionalStringPredicate.validate(42)).toStrictEqual({
        valid: false,
        errorMessages: ['root: Expected "string", but received "number"'],
      });
    });
  });
});
