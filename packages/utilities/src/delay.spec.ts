import { echo, delay, clearableEcho } from "./delay";

jest.useFakeTimers();

describe("delay", () => {
  it("returns a promise which resolves after the delay.", async () => {
    const promise = delay(100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    const result = await promise;
    expect(result).not.toBeDefined();
  });
});

describe("echo", () => {
  it("returns a promise which resolves, after the delay, to the supplied value.", async () => {
    const promise = echo('{result}', 100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toBe("{result}");
  });

  it("returns the result of the supplied factory after the given time.", async () => {
    const factory = jest.fn<string, []>().mockReturnValue('{result}')
    const promise = echo(factory, 100);

    jest.advanceTimersByTime(99);
    expect(factory).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);

    const result = await promise;
    expect(result).toBe('{result}');
  });
});

describe("clearableEcho", () => {
  it("returns a promise which resolves, after the delay, to the supplied value.", async () => {
    const { promise } = clearableEcho('{result}', 100);
    expect(promise).toBeInstanceOf(Promise);

    jest.advanceTimersByTime(100);

    const result = await promise;
    expect(result).toBe("{result}");
  });

  it.todo("can i test the clear without mocking setTimeout?");

  it("returns the result of the supplied factory after the given time.", async () => {
    const factory = jest.fn<string, []>().mockReturnValue('{result}')
    const { promise } = clearableEcho(factory, 100);

    jest.advanceTimersByTime(99);
    expect(factory).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);

    const result = await promise;
    expect(result).toBe('{result}');
  });
});
