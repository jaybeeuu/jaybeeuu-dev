import { when } from "jest-when";
import { MockStorage } from "../../test/mock-storage";
import defaultState from "./default-state.json";
import { setStorage, loadState, saveState } from "./persistence";
import log from "./logger";

jest.mock("./logger");

const STATE_KEY = "state";

describe("persistence ", () => {
  let storage;

  beforeEach(() => {
    storage = new MockStorage();
    setStorage(storage);
  });

  afterEach(() => {
    setStorage();
  });

  describe("loadState", () => {
    it("Logs errors and returns undefined.", () => {
      const error = new Error();
      storage.getItem.mockImplementation(() => {
        throw error;
      });

      const state = loadState();

      expect(state).not.toBeDefined();
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith(error);
    });

    it("returns default state if no state is found.", () => {
      when(storage.getItem).calledWith(STATE_KEY).mockReturnValue(null);

      const state = loadState();

      expect(state).toBe(defaultState);
    });

    it("returns the JSON.parsed state.", () => {
      const expectedState = {
        id: "{the expected state}",
        child: { id: "A child object" }
      };
      when(storage.getItem).calledWith(STATE_KEY).mockReturnValue(JSON.stringify(expectedState));

      const state = loadState();

      expect(state).toEqual(expectedState);
    });
  });

  describe("saveState", () => {
    it("Logs errors.", () => {
      const error = new Error();
      storage.setItem.mockImplementation(() => {
        throw error;
      });

      saveState({});

      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith(error);
    });

    it("stores the JSON.parsed state.", () => {
      const state = {
        id: "{the expected state}",
        child: { id: "A child object" }
      };

      saveState(state);

      expect(storage.setItem).toBeCalledTimes(1);
      expect(storage.setItem).toBeCalledWith("state", JSON.stringify(state));
    });
  });
});