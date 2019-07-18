import env from "../api/env";
import defaultState from "./default-state.json";
import log from "./logger";

const defaultPersistenceStore = env.NODE_ENV === "development" ? window.sessionStorage : window.localStorage;

let persistenceStore = defaultPersistenceStore;

export const setStorage = (implementation) => persistenceStore = implementation || defaultPersistenceStore;

const STATE_KEY = "state";

export const loadState = () => {
  try {
    const serializedState = persistenceStore.getItem(STATE_KEY);

    return serializedState === null
      ? defaultState
      : JSON.parse(serializedState);
  } catch (err) {
    log(err);
    return undefined;
  }

};
export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    persistenceStore.setItem(STATE_KEY, serializedState);
  } catch (err) {
    log(err);
  }
};