import { echo, delay } from "./delay.js";
import { describe, expect, it, jest } from "@jest/globals";

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

    await expect(promise).resolves.toBeUndefined();
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
    const factory = jest.fn<() => string>().mockReturnValue("{result}");
    const promise = echo(factory, 100);

    jest.advanceTimersByTime(99);
    expect(factory).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);

    const result = await promise;
    expect(result).toBe("{result}");
  });

  it("resolves first in a race.", async () => {
    setupMockTimers();
    const promise = echo("{value}", 100);
    const timeout = new Promise((resolve) =>
      setTimeout(() => {
        resolve("{NOT Value}");
      }, 110),
    );

    jest.advanceTimersByTime(110);

    const result = await Promise.race([promise, timeout]);

    expect(result).toBe("{value}");
  });

  it("does not resolve first if the clear function it called.", async () => {
    setupMockTimers();
    const promise = echo("{value}", 100);
    const timeout = new Promise((resolve) =>
      setTimeout(() => {
        resolve("{NOT value}");
      }, 110),
    );

    promise.clear();

    jest.advanceTimersByTime(110);

    const result = await Promise.race([promise, timeout]);

    expect(result).toBe("{NOT value}");
  });
});
