import { createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import thunk from "redux-thunk";
import rootReducer from "./root";
import configureStore from "./configure-store";

jest.mock("redux");
jest.mock("redux-devtools-extension/logOnlyInProduction");
jest.mock("redux-thunk");
jest.mock("./root");

describe("configure-store", () => {
  it("creates the store with the rootReducer, initial state and composed devtools middleware.", () => {
    const initialState = "{initialState}";
    const composeWithDevToolsResult = "{composeWithDevTools}";
    composeWithDevTools.mockReturnValue(composeWithDevToolsResult);

    configureStore(initialState);

    expect(createStore).toHaveBeenCalledWith(
      rootReducer,
      initialState,
      composeWithDevToolsResult
    );
  });

  it("composes the dev tools with the applied middleware.", () => {
    const applyMiddlewareResult = "{applyMiddleware}";
    applyMiddleware.mockReturnValue(applyMiddlewareResult);

    configureStore();

    expect(composeWithDevTools).toHaveBeenCalledWith(applyMiddlewareResult);
  });


  it("applies redux think to the middleware.", () => {
    configureStore();

    expect(applyMiddleware).toHaveBeenCalledWith(thunk);
  });
});