import { withFakeTimers }  from "@jaybeeuu/utilities/test";
import type { DerivationContext, DerivedValue, PrimitiveValue } from "./state/index.js";
import { DerivedValueState } from "./state/index.js";
import { Store } from "./store.js";

describe("recoilless store", () => {
  describe("derived values", () => {
    const firstName: PrimitiveValue<string> = {
      name: "firstName",
      initialValue: "Edmund"
    };

    const surname: PrimitiveValue<string> = {
      name: "surname",
      initialValue: "Bickley-Wallace"
    };

    const fullName: DerivedValue<string> = {
      name: "fullName",
      derive: ({ get }: DerivationContext<string>): string => {
        return `${get(firstName)} ${get(surname)}`;
      }
    };

    it("allows the retrieval of a derived value from the store.", () => {
      const store = new Store();
      const fullNameValueState = store.getValue(fullName);
      expect(fullNameValueState).toBeInstanceOf(DerivedValueState);
    });

    it("has the value in the store once it has been retrieved.", () => {
      const store = new Store();
      store.getValue(fullName);
      expect(store.hasValue(fullName)).toBe(true);
    });

    it("returns a consistent instance of a derived value.", () => {
      const store = new Store();
      const firstState = store.getValue(fullName);
      const secondState = store.getValue(fullName);
      expect(firstState).toBe(secondState);
    });

    it("sets the initial current value using the derive function and dependencies.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      expect(state.current).toBe(
        `${firstName.initialValue} ${surname.initialValue}`
      );
    });

    it("can return a promise from he derive function.", async () => {
      const store = new Store();
      const state = store.getValue({
        name: "asyncFullName",
        derive: ({ get }: DerivationContext<Promise<string>>): Promise<string> => new Promise<string>((resolve) => {
          setTimeout(() => resolve(`${get(firstName)} ${get(surname)}`), 0);
        })
      });
      await expect(state.current).resolves.toBe(
        `${firstName.initialValue} ${surname.initialValue}`
      );
    });

    it("updates the current value when the dependencies are updated.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const firstNameState = store.getValue(firstName);

      firstNameState.set("Isaac");

      expect(state.current).toBe(
        `Isaac ${surname.initialValue}`
      );
    });

    it("updates the current value when more than one dependency is updated.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const firstNameState = store.getValue(firstName);
      firstNameState.set("Isaac");

      const secondNameState = store.getValue(surname);
      secondNameState.set("Wallace-Bickley");

      expect(state.current).toBe(
        "Isaac Wallace-Bickley"
      );
    });

    it("updates all subscribers when the dependencies are updated.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const firstListener = jest.fn();
      state.subscribe(firstListener);
      const secondListener = jest.fn();
      state.subscribe(secondListener);
      const firstNameState = store.getValue(firstName);

      firstNameState.set("Isaac");

      expect(firstListener).toHaveBeenCalledWith(`Isaac ${surname.initialValue}`);
      expect(secondListener).toHaveBeenCalledWith(`Isaac ${surname.initialValue}`);
    });

    it("any one function can only be subscribed once.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const listener = jest.fn();
      state.subscribe(listener);
      state.subscribe(listener);
      const firstNameState = store.getValue(firstName);

      firstNameState.set("Isaac");

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it("removes the value from the store once all subscriptions are released.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const firstUnsubscribe = state.subscribe(() => {});
      const secondUnsubscribe = state.subscribe(() => {});

      firstUnsubscribe();
      secondUnsubscribe();

      expect(store.hasValue(fullName)).toBe(false);
    });

    it("returns a new instance if retrieved after all subscriptions are released.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const firstUnsubscribe = state.subscribe(() => {});
      const secondUnsubscribe = state.subscribe(() => {});

      firstUnsubscribe();
      secondUnsubscribe();

      const newState = store.getValue(fullName);

      expect(newState).not.toBe(state);
    });

    it("unsubscribes and removes other from te store values when unsubscribed.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const unsubscribe = state.subscribe(() => {});
      store.getValue(firstName).set("Isaac");

      unsubscribe();

      expect(store.hasValue(firstName)).toBe(false);
      expect(store.hasValue(surname)).toBe(false);
    });

    it("resets other values when unsubscribed.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const unsubscribe = state.subscribe(() => {});
      store.getValue(firstName).set("Isaac");

      unsubscribe();

      const newState = store.getValue(fullName);

      expect(newState.current).toBe(
        `${firstName.initialValue} ${surname.initialValue}`
      );
    });

    it("exposes the name on a property.", () => {
      const store = new Store();
      const state = store.getValue(fullName);

      expect(state.name).toBe("fullName");
    });
  });

  describe("stateful Derived Value", () => {
    const counterChange: PrimitiveValue<-1 | 0 | 1> = {
      name: "changeEvent",
      initialValue: 0
    };

    const counter: DerivedValue<number> = {
      name: "counter",
      derive: ({ get, previousValue = 0 }: DerivationContext<number>): number => {
        const change = get(counterChange);
        const newValue = previousValue + change;
        previousValue = newValue;
        return newValue;
      }
    };

    it("has the correct initial value on the state retrieved.", () => {
      const store = new Store();
      const counterValueState = store.getValue(counter);
      expect(counterValueState.current).toBe(0);
    });

    it("passes the previous value which you can use to derive values.", () => {
      const store = new Store();
      const counterValueState = store.getValue(counter);

      const change = store.getValue(counterChange);

      change.set(1);
      expect(counterValueState.current).toBe(1);

      change.set(0);
      expect(counterValueState.current).toBe(1);

      change.set(1);
      expect(counterValueState.current).toBe(2);
    });

    describe("delayed store removal", () => {
      withFakeTimers();

      const delayedRemovalValue: DerivedValue<object> = {
        name: "delayedGCValue",
        derive: ({ previousValue = {} }: DerivationContext<object>): object => {
          return previousValue;
        },
        removalSchedule: { delay: 500, schedule: "delayed" }
      };

      it("does not recalculate the value if something resubscribes within the delay.", () => {
        const store = new Store();

        const firstValueState = store.getValue(delayedRemovalValue);
        const unsubscribe = firstValueState.subscribe(() => {});
        const first = firstValueState.current;
        unsubscribe();

        jest.advanceTimersByTime(499);

        const secondValueState = store.getValue(delayedRemovalValue);
        const second = secondValueState.current;
        secondValueState.subscribe(() => {});

        expect(first).toBe(second);
      });

      it("recalculates the value if something resubscribes after the delay lapses.", () => {
        const store = new Store();

        const firstValueState = store.getValue(delayedRemovalValue);
        const unsubscribe = firstValueState.subscribe(() => {});
        const first = firstValueState.current;
        unsubscribe();

        jest.advanceTimersByTime(500);

        const secondValueState = store.getValue(delayedRemovalValue);
        const second = secondValueState.current;
        secondValueState.subscribe(() => {});

        expect(first).not.toBe(second);
      });

      it("does not recalculate the value if the delay comes from the store options.", () => {
        const store = new Store({
          defaultRemovalSchedule: { delay: 500, schedule: "delayed" }
        });

        const value = {
          name: "delayedGCValue",
          derive: ({ previousValue = {} }: DerivationContext<object>): object => {
            return previousValue;
          }
        };
        const firstValueState = store.getValue(value);
        const unsubscribe = firstValueState.subscribe(() => {});
        const first = firstValueState.current;
        unsubscribe();

        jest.advanceTimersByTime(499);

        const secondValueState = store.getValue(value);
        const second = secondValueState.current;
        secondValueState.subscribe(() => {});

        expect(first).toBe(second);
      });
    });
  });
});
