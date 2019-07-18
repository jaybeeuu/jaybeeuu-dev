import ReactDOM from "react-dom";

import { saveState, loadState } from "./api/persistence";
import debounce from "./utilities/debounce";
import configureStore from "./redux/configure-store";

import start from "./main";

jest.unmock("./index");

jest.mock("react-dom");
jest.mock("./api/persistence");
jest.mock("./components/App");
jest.mock("./redux/configure-store");
jest.mock("./utilities/debounce");

describe("index", () => {
  const getMockStore = () => ({
    dispatch: jest.fn(),
    getState: jest.fn(),
    subscribe: jest.fn()
  });

  const setupConfigureStore = ({
    store = getMockStore()
  } = {}) => {
    configureStore.mockReturnValue(store);
  };

  const setupReactDOM = () => {
    ReactDOM.render = jest.fn();
  };

  it("configured the store with state from the persitsence api.", () => {
    setupReactDOM();
    setupConfigureStore();

    const state = { id: "state" };
    loadState.mockReturnValue(state);

    start();

    expect(configureStore).toHaveBeenCalledWith(state);
  });

  it("subscribes to the store with a debounced function.", () => {
    setupReactDOM();
    const store = getMockStore();
    setupConfigureStore({ store });

    debounce.mockReturnValue("{debounced}");

    start();

    expect(store.subscribe).toHaveBeenCalledWith("{debounced}");
  });

  it("debounce has been called with the correct delay.", () => {
    setupReactDOM();
    setupConfigureStore();

    start();

    expect(debounce).toHaveBeenCalledWith(expect.any(Function), 500);
  });

  it("the function which has been debounced saves the state from the store.", () => {
    setupReactDOM();

    const store = getMockStore();
    const state = { id: "{state}" };
    store.getState.mockReturnValue(state);

    setupConfigureStore({ store });

    start();

    debounce.mock.calls[0][0]();

    expect(saveState).toHaveBeenCalledWith(state);
  });
});