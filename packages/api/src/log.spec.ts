/* eslint-disable no-console */
import "../test/custom-matchers";
import * as log from "./log";

describe("log", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("info", () => {
    it("passes arguments to console.log", () => {
      const args = [1, "2", { id: 3 }];
      log.info("message", ...args);

      expect(console.log).toHaveBeenCalledWith("message", ...args);
    });
  });

  describe("error", () => {
    it("formats a message containing message and stack if supplied.", () => {
      const message = "{message}";
      const error = {
        message: "{message}",
        stack: "{stack}"
      };

      log.error(message, error);

      expect(console.error).toHaveBeenCalledWith(expect.stringContainingAll(
        message,
        error.message,
        error.stack
      ));
    });

    it("when passed an Error the message and stack are sent onto the console", () => {
      const message = "{message}";
      const error = new Error("{error message}");
      error.stack = "{stack}";

      log.error("message", error);

      expect(console.error).toHaveBeenCalledWith(expect.stringContainingAll(
        message,
        error.message,
        error.stack
      ));
    });
  });
});