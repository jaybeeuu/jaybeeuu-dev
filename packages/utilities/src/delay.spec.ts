import { echo, delay, clearableEcho } from "./delay";

jest.useFakeTimers();

describe("delay", () => {
  it("returns a promise which resolves after the delay.", () => {
    const promise = delay(100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    expect(promise).resolves.not.toBeDefined();
  });
});

describe("echo", () => {
  it("returns a promise which resolves, after the delay, to the supplied value.", async () => {
    const promise = echo('{result}', 100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    expect(promise).resolves.toBe("{result}");
  });
});

describe("clearableEcho", () => {
  it("returns a promise which resolves, after the delay, to the supplied value.", async () => {
    const { promise } = clearableEcho('{result}', 100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    expect(promise).resolves.toBe("{result}");
  });

  it.todo("can i test the clear without mocking setTimeout?");
});
