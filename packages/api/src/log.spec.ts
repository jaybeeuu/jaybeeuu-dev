/* eslint-disable no-console */
import "../test/custom-matchers";
import log from "./log";

describe("log", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("info", () => {
    it("passes arguments to console.log", () => {
      const args = [1, "2", { id: 3 }];
      log.info(...args);

      expect(console.log).toHaveBeenCalledWith(...args);
    });
  });

  describe("error", () => {
    it("passes arguments to console.error", () => {
      const error = {
        name: "{name}",
        message: "{message}",
        stack: "{stack}"
      };

      log.error(error);

      expect(console.error).toHaveBeenCalledWith(expect.stringContainingAll(
        error.name,
        error.message,
        error.stack
      ));
    });
  });
});