import type { DerivationContext, DerivedValue, PrimitiveValue } from "./state/index";
import { DerivedValueState } from "./state/index";
import { Store } from "./store";

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

      firstNameState.setValue("Isaac");

      expect(state.current).toBe(
        `Isaac ${surname.initialValue}`
      );
    });

    it("updates the current value when more than one dependency is updated.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const firstNameState = store.getValue(firstName);
      firstNameState.setValue("Isaac");

      const secondNameState = store.getValue(surname);
      secondNameState.setValue("Wallace-Bickley");

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

      firstNameState.setValue("Isaac");

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

      firstNameState.setValue("Isaac");

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
      store.getValue(firstName).setValue("Isaac");

      unsubscribe();

      expect(store.hasValue(firstName)).toBe(false);
      expect(store.hasValue(surname)).toBe(false);
    });

    it("resets other values when unsubscribed.", () => {
      const store = new Store();
      const state = store.getValue(fullName);
      const unsubscribe = state.subscribe(() => {});
      store.getValue(firstName).setValue("Isaac");

      unsubscribe();

      const newState = store.getValue(fullName);

      expect(newState.current).toBe(
        `${firstName.initialValue} ${surname.initialValue}`
      );
    });
  });

  describe("stateful Derived Value", () => {
    const counterChange: PrimitiveValue<-1 | 0 | 1> = {
      name: "changeEvent",
      initialValue: 0
    };

    const counter: DerivedValue<number> = {
      name: "runningTotal",
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

      change.setValue(1);
      expect(counterValueState.current).toBe(1);

      change.setValue(0);
      expect(counterValueState.current).toBe(1);

      change.setValue(1);
      expect(counterValueState.current).toBe(2);
    });
  });
});
