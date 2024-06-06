import { conv } from "./index.js";
import { env } from "node:process";

jest.mock("dotenv");

describe("conv", () => {
  it("throws if is a mandatory variable is not present.", () => {
    delete env.THING;
    expect(() => conv("THING")).toThrow(
      new TypeError(
        `Expected environment variable THING to be defined, but it was "undefined".`,
      ),
    );
  });

  it("makes a mandatory variable available.", () => {
    env.THING = "{thing}";
    const vars = conv("THING");
    expect(vars.THING).toBe("{thing}");
  });

  it("sets a variable with a default value to the default if it is missing.", () => {
    delete env.THING;
    const vars = conv({ name: "THING", default: "{default}" });
    expect(vars.THING).toBe("{default}");
  });

  it("sets a variable with a default to the supplied value if it is present.", () => {
    env.THING = "{thing}";
    const vars = conv({ name: "THING", default: "{default}" });
    expect(vars.THING).toBe("{thing}");
  });

  it("makes an optional variable available if it is present.", () => {
    env.THING = "{thing}";
    const vars = conv({ name: "THING", optional: true });
    expect(vars.THING).toBe("{thing}");
  });

  it("does not throw if an optional variable is not present.", () => {
    delete env.THING;
    const vars = conv({ name: "THING", optional: true });
    expect(vars.THING).toBeNull();
  });
});
