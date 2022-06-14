/* eslint-disable no-console */
import "../../compost/test/custom-matchers.js";
import * as log from "./log.js";

jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

describe("log", () => {
  describe("info", () => {
    it("passes arguments to console.log", () => {
      const args = [1, "2", { id: 3 }];
      log.info("message", ...args);

      expect(console.log).toHaveBeenCalledWith("message", ...args);
    });
  });

  describe("error", () => {
    it("passes arguments to console.log", () => {
      const args = [1, "2", { id: 3 }];
      log.error("message", ...args);

      expect(console.error).toHaveBeenCalledWith("message", ...args);
    });
  });

  describe("getErrorMessage", () => {
    const samples: {
      args: Parameters<typeof log.getErrorMessage>,
      expectedOutput: string
    }[] = [
      {
        args: [
          { message: "{error message}", stack: "{stack}" }
        ],
        expectedOutput: [
          "{",
          "  \"message\": \"{error message}\",",
          "  \"stack\": \"{stack}\"",
          "}"
        ].join("\n")
      },
      {
        args: [
          (() => {
            const error = new Error("{error message}");
            error.stack = "{stack}";
            return error;
          })()
        ],
        expectedOutput: "{error message}\n{stack}"
      },
      {
        args: [
          (() => {
            const error = new Error("{error message}");
            error.stack = undefined;
            return error;
          })()
        ],
        expectedOutput: "{error message}\nNo Stack"
      },
      {
        args: [
          ""
        ],
        expectedOutput: "{empty string}"
      },
      {
        args: [
          null
        ],
        expectedOutput: "null"
      },
      {
        args: [
          undefined
        ],
        expectedOutput: "undefined"
      }
    ];
    it.each(samples)(
      "$#: should return $expectedOutput when passed args: $args",
      ({ args, expectedOutput }) => {
        const result = log.getErrorMessage(...args);

        expect(result).toBe(expectedOutput);
      }
    );
  });
});
