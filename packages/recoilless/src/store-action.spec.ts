import type { PrimitiveValue } from "./state/index";
import type { Action, ActionContext} from "./store";
import { Store } from "./store";

describe("recoilless store", () => {
  describe("action", () => {
    const storedValue: PrimitiveValue<number> = {
      name: "storedValue",
      initialValue: 1
    };

    const addDoubleToValue: Action<[number]> = (
      { get, set }: ActionContext,
      valueToDouble: number
    ): void => {
      const value = get(storedValue);
      const newValue = 2 * value + valueToDouble;
      set(storedValue, newValue);
    };

    it("sets the value with the result of the calculation.", () => {
      const store = new Store();
      const setter = store.getActor(addDoubleToValue);
      setter(3);
      const result = store.getValue(storedValue);
      expect(result.current).toBe(5);
    });
  });
});
