/* eslint-disable no-console */
import "../../compost/test/custom-matchers";
import * as log from "./log";
import chalk from "chalk";

interface Sample {
  args: [string, ...unknown[]];
  consoleCalledWith: string[];
}

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
    const samples: Sample[] = [
      {
        args: [
          "{message}",
          { message: "{error message}", stack: "{stack}" }
        ],
        consoleCalledWith: [
          "{message}",
          [
            "{",
            "  \"message\": \"{error message}\",",
            "  \"stack\": \"{stack}\"",
            "}"
          ].join("\n")
        ]
      },
      {
        args: [
          "{message}",
          (() => {
            const error = new Error("{error message}");
            error.stack = "{stack}";
            return error;
          })()
        ],
        consoleCalledWith: [
          "{message}",
          "{error message}\n{stack}"
        ]
      },
      {
        args: [
          "{message}",
          (() => {
            const error = new Error("{error message}");
            error.stack = undefined;
            return error;
          })()
        ],
        consoleCalledWith: [
          "{message}",
          "{error message}\nNo Stack"
        ]
      },
      {
        args: [
          "{message}",
          ""
        ],
        consoleCalledWith: [
          "{message}",
          "Empty String"
        ]
      },
      {
        args: [
          "{message}",
          null
        ],
        consoleCalledWith: [
          "{message}",
          "null"
        ]
      },
      {
        args: [
          "{message}",
          undefined
        ],
        consoleCalledWith: [
          "{message}",
          "undefined"
        ]
      }
    ];
    samples.forEach(({ args, consoleCalledWith }) => {
      it(`should call console.error(${consoleCalledWith.join(", ")}) when passed args: ${JSON.stringify(args, null, 2)}`, () => {
        log.error(...args);

        expect(console.error).toHaveBeenCalledWith(
          chalk.red(consoleCalledWith.join("\n\n"))
        );
      });
    });
  });
});
