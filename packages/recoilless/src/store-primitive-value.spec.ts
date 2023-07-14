import { withFakeTimers } from "@jaybeeuu/utilities/test";
import type { PrimitiveValue } from "./state/index.js";
import { PrimitiveValueState } from "./state/index.js";
import { Store } from "./store.js";

const firstName: PrimitiveValue<string> = {
  name: "firstName",
  initialValue: "Edmund"
};

describe("recoilless store", () => {
  describe("primitive values", () => {
    it("allows the retrieval of a primitive value from the store.", () => {
      const store = new Store();
      const firstNameValueState = store.getValue(firstName);
      expect(firstNameValueState).toBeInstanceOf(PrimitiveValueState);
    });

    it("has the value in the store once it has been retrieved.", () => {
      const store = new Store();
      store.getValue(firstName);
      expect(store.hasValue(firstName)).toBe(true);
    });

    it("sets the value on the instance returned to the initialValue.", () => {
      const store = new Store();
      const firstNameValueState = store.getValue(firstName);

      expect(firstNameValueState.current).toBe(firstName.initialValue);
    });

    it("returns a consistent instance of a primitive value.", () => {
      const store = new Store();
      const firstState = store.getValue(firstName);
      const secondState = store.getValue(firstName);
      expect(firstState).toBe(secondState);
    });

    it("updates the current value when set.", () => {
      const store = new Store();
      const state = store.getValue(firstName);
      const newName = "{newName}";

      state.set(newName);

      expect(state.current).toBe(newName);
    });

    it("notifies all the subscribed functions of changes.", () => {
      const store = new Store();
      const state = store.getValue(firstName);
      const firstListener = jest.fn();
      state.subscribe(firstListener);
      const secondListener = jest.fn();
      state.subscribe(secondListener);
      const newName = "{newName}";

      state.set(newName);

      expect(firstListener).toHaveBeenCalledWith(newName);
      expect(secondListener).toHaveBeenCalledWith(newName);
    });

    it("any one function can only be subscribed once.", () => {
      const store = new Store();
      const state = store.getValue(firstName);
      const listener = jest.fn();
      state.subscribe(listener);
      state.subscribe(listener);
      const firstNameState = store.getValue(firstName);

      firstNameState.set("Isaac");

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("notifies subscribed functions if the value is the same.", () => {
      const store = new Store();
      const state = store.getValue(firstName);
      const listener = jest.fn();
      state.subscribe(listener);

      state.set(firstName.initialValue);

      expect(listener).toHaveBeenCalledWith(firstName.initialValue);
    });

    it("removes the value from the store after all subscriptions are released.", () => {
      const store = new Store();
      const state = store.getValue(firstName);
      const firstUnsubscribe = state.subscribe(() => {});
      const secondUnsubscribe = state.subscribe(() => {});

      firstUnsubscribe();
      secondUnsubscribe();

      expect(store.hasValue(firstName)).toBe(false);
    });

    it("returns a new instance if retrieved after all subscriptions are released.", () => {
      const store = new Store();
      const state = store.getValue(firstName);
      const firstUnsubscribe = state.subscribe(() => {});
      const secondUnsubscribe = state.subscribe(() => {});

      firstUnsubscribe();
      secondUnsubscribe();

      const newState = store.getValue(firstName);

      expect(newState).not.toBe(state);
    });

    it("resets the value when retrieved after all subscriptions are released.", () => {
      const store = new Store();
      const state = store.getValue(firstName);
      const firstUnsubscribe = state.subscribe(() => {});
      const secondUnsubscribe = state.subscribe(() => {});
      state.set("Isaac");

      firstUnsubscribe();
      secondUnsubscribe();

      const newState = store.getValue(firstName);

      expect(newState.current).toBe(firstName.initialValue);
    });

    it("throws if the value is updated by a listener.", () => {
      const store = new Store();
      const state = store.getValue(firstName);

      state.subscribe(() => state.set("Harold"));

      expect(() => state.set("Henry")).toThrow("Value \"firstName\" was updated by a subscriber. A value may mot update as a result of an update to itself.");
    });

    it("allows other values to be updated by a listener.", () => {
      const store = new Store();
      const firstNameSate = store.getValue(firstName);
      const surnameSate = store.getValue({ name: "surname", initialValue: "Ford" });

      firstNameSate.subscribe(() => surnameSate.set("Kissinger"));

      expect(() => firstNameSate.set("Henry")).not.toThrow();
    });

    it("exposes the name on a property.", () => {
      const store = new Store();
      const state = store.getValue(firstName);

      expect(state.name).toBe("firstName");
    });
  });

  describe("delayed store removal", () => {
    withFakeTimers();

    const delayedRemovalValue: PrimitiveValue<number> = {
      name: "delayedRemoval",
      initialValue: 0,
      removalSchedule: { delay: 500, schedule: "delayed" }
    };

    it("does not recalculate the value if something resubscribes within the delay.", () => {
      const store = new Store();

      const firstValueState = store.getValue(delayedRemovalValue);
      const unsubscribe = firstValueState.subscribe(() => {});
      firstValueState.set(1);
      unsubscribe();

      jest.advanceTimersByTime(499);

      const secondValueState = store.getValue(delayedRemovalValue);
      const second = secondValueState.current;
      secondValueState.subscribe(() => {});

      expect(second).toBe(1);
    });

    it("recalculates the value if something resubscribes after the delay lapses.", () => {
      const store = new Store();

      const firstValueState = store.getValue(delayedRemovalValue);
      const unsubscribe = firstValueState.subscribe(() => {});
      firstValueState.set(1);
      unsubscribe();

      jest.advanceTimersByTime(500);

      const secondValueState = store.getValue(delayedRemovalValue);
      const second = secondValueState.current;
      secondValueState.subscribe(() => {});

      expect(second).toBe(0);
    });

    it("delays removal if the default schedule is delayed, and there is no schedule supplied via the value.", () => {
      const store = new Store({
        defaultRemovalSchedule: { delay: 500, schedule: "delayed" }
      });

      const value = { name: "number", initialValue: 0 };

      const firstValueState = store.getValue(value);
      const unsubscribe = firstValueState.subscribe(() => {});
      firstValueState.set(1);
      unsubscribe();

      jest.advanceTimersByTime(499);

      const secondValueState = store.getValue(value);
      const second = secondValueState.current;
      secondValueState.subscribe(() => {});

      expect(second).toBe(1);
    });
  });
});
