import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { loadState, saveState } from "./api/persistence";
import App from "./components/App";
import configureStore from "./redux/configure-store";
import debounce from "./utilities/debounce";

const start = () => {
  const persistedState = loadState();

  const store = configureStore(persistedState);

  store.subscribe(debounce(() => {
    saveState(store.getState());
  }, 500));

  ReactDOM.render((
    <Provider store={store}>
      <App />
    </Provider>
  ), document.getElementById("app"));
};

export default start;