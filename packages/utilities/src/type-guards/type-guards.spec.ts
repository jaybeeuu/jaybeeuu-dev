import { is, isObject, optional, or } from "./index.js";

describe("type-guards", () => {
  describe("isObject", () => {
    it("identifies a complex object correctly.", () => {
      const typeGuard = isObject({
        blur: optional(is("number")),
        fileName: is("string"),
        size: optional(or(
          isObject({
            height: is("number"),
            width: is("number")
          }),
          or(
            isObject({ height: is("number") }),
            isObject({ width: is("number") })
          )
        ))
      });

      expect(typeGuard({
        fileName: "./src/app/images/out/smaller-{}.webp",
        size: { height: 400 }
      })).toBe(true);
    });
  });
});
