import { renderHook } from "@testing-library/preact-hooks";
import { StoreProvider } from "./store-provider";
import { useValue } from "./use-value";

describe("useValue", () => {
  describe("primitive", () => {
    it("returns the initial value.", () => {
      const renderer = renderHook(
        () => useValue({ name: "holiday", initialValue: "whistler" }),
        { wrapper: StoreProvider }
      );

      expect(renderer.result.current).toStrictEqual(["whistler", expect.any(Function)]);
    });
  });
});
