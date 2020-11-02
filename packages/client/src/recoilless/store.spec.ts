import { DerivationContext, DerivedValue, DerivedValueState, PrimitiveValue, PrimitiveValueState } from "./state";
import { Store } from "./store";

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
  derive: ({ get }: DerivationContext): string => {
    return `${get(firstName)} ${get(surname)}`;
  }
};

describe("recoiless store", () => {
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

      state.setValue(newName);

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

      state.setValue(newName);

      expect(firstListener).toHaveBeenCalledWith(newName);
      expect(secondListener).toHaveBeenCalledWith(newName);
    });

    it("does not notify subscribed functions if the value is the same.", () => {
      const store = new Store();
      const state = store.getValue(firstName);
      const listener = jest.fn();
      state.subscribe(listener);

      state.setValue(firstName.initialValue);

      expect(listener).not.toHaveBeenCalled();
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
      state.setValue("Isaac");

      firstUnsubscribe();
      secondUnsubscribe();

      const newState = store.getValue(firstName);

      expect(newState.current).toBe(firstName.initialValue);
    });
  });

  describe("derived values", () => {
    it("allows the retrieval of a derived value from the store.", () => {
      const store = new Store();
      const fullnameValueState = store.getValue(fullName);
      expect(fullnameValueState).toBeInstanceOf(DerivedValueState);
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
        derive: ({ get }: DerivationContext): Promise<string> => new Promise<string>((resolve) => {
          setTimeout(() => resolve(`${get(firstName)} ${get(surname)}`), 0);
        })
      });
      expect((await state.current)).toBe(
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
});
