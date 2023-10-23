import type { TypeAssertion } from "./index";
import { is, assert, assertIsNotNullish } from "./index";

describe("assertions", () => {
  describe("assert", () => {
    it("throws when the candidate does not match the type guard.", () => {
      const assertIsString: TypeAssertion<string> = assert(is("string"));
      expect(
        () => { assertIsString(100); }
      ).toThrow(new TypeError("Expected a string but got a number."));
    });

    it("doesn't throw when the candidate matches the type guard.", () => {
      const assertIsString: TypeAssertion<string> = assert(is("string"));
      expect(
        () => { assertIsString("100"); }
      ).not.toThrow();
    });
  });

  describe("assertIsNotNullish", () => {
    it.each([
      { candidate: null },
      { candidate: undefined }
    ])("$#: throws when the candidate is nullish ($candidate).", ({ candidate }) => {
      expect(
        () => { assertIsNotNullish(candidate); }
      ).toThrow(new TypeError(`Encountered unexpected ${String(candidate)}.`));
    });

    it("doesn't throw when the candidate is not null or undefined.", () => {
      expect(
        () => { assertIsNotNullish("100"); }
      ).not.toThrow();
    });
  });
});
