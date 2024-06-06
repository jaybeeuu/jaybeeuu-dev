import { assertIsNotNullish } from "./index";

import { describe, expect, it } from "@jest/globals";
describe("pre-built", () => {
  describe("assertIsNotNullish", () => {
    it.each([{ candidate: null }, { candidate: undefined }])(
      "$#: throws when the candidate is nullish ($candidate).",
      ({ candidate }) => {
        expect(() => {
          assertIsNotNullish(candidate);
        }).toThrow(
          new TypeError(`Encountered unexpected ${String(candidate)}.`),
        );
      },
    );

    it("doesn't throw when the candidate is not null or undefined.", () => {
      expect(() => {
        assertIsNotNullish("100");
      }).not.toThrow();
    });
  });
});
