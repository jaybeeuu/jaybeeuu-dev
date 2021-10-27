import { echo, delay, clearableEcho } from "./delay";

const setupMockTimers = (): void => {
  jest.useFakeTimers();
  jest.clearAllTimers();
};

describe("delay", () => {
  it("returns a promise which resolves after the delay.", async () => {
    setupMockTimers();
    const promise = delay(100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toBeUndefined();
  });
});

describe("echo", () => {
  it("returns a promise which resolves, after the delay, to the supplied value.", async () => {
    setupMockTimers();
    const promise = echo("{result}", 100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toBe("{result}");
  });

  it("returns the result of the supplied factory after the given time.", async () => {
    setupMockTimers();
    const factory = jest.fn<string, []>().mockReturnValue("{result}");
    const promise = echo(factory, 100);

    jest.advanceTimersByTime(99);
    expect(factory).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);

    const result = await promise;
    expect(result).toBe("{result}");
  });
});

describe("clearableEcho", () => {
  it("returns a promise which resolves, after the delay, to the supplied value.", async () => {
    setupMockTimers();
    const { promise } = clearableEcho("{result}", 100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toBe("{result}");
  });

  it.todo("can i test the clear without mocking setTimeout?");

  it("returns the result of the supplied factory after the given time.", async () => {
    setupMockTimers();
    const factory = jest.fn<string, []>().mockReturnValue("{result}");
    const { promise } = clearableEcho(factory, 100);

    jest.advanceTimersByTime(99);
    expect(factory).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);

    const result = await promise;
    expect(result).toBe("{result}");
  });
});
