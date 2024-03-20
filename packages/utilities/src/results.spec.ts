import { failure, success } from "./results.js";

describe("success", () => {
  it("returns a success.", () => {
    expect(success("{value}").success).toBe(true);
  });

  it("returns a success with thh right value.", () => {
    expect(success("{value}").value).toBe("{value}");
  });

  it("can be called with no arguments..", () => {
    expect(success().success).toBe(true);
  });
});

describe("failure", () => {
  it("returns a failure.", () => {
    expect(failure("{reason}").success).toBe(false);
  });

  it("returns a failure with the correct reason..", () => {
    expect(failure("{reason}").reason).toBe("{reason}");
  });

  it("sets the message to {no message} when none is passed.", () => {
    expect(failure("{reason}").message).toBe("{No message}");
  });

  it("sets the message when an Error is passed.", () => {
    expect(failure("{reason}", new Error("Whoops!")).message).toBe("Whoops!");
  });

  it("sets the stack when an Error is passed.", () => {
    const error = new Error("Whoops!");
    expect(failure("{reason}", error).stack).toBe(error.stack);
  });

  it("sets the stack when an Error is not passed.", () => {
    expect(failure("{reason}").stack).toBeDefined();
  });

  it("the stack set when an Error is not passed does not include entris from results.ts.", () => {
    expect(failure("{reason}").stack).not.toMatch("results.ts");
  });
});
