import debounce from "./debounce";

jest.useFakeTimers();
type Args = [number, string, { id: number }];

describe("debounce", () => {
  it("returns a function that does not execute the supplied actor within the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;

    debounce(actor, delay)();
    jest.advanceTimersByTime(delay - 1);

    expect(actor).toHaveBeenCalledTimes(0);
  });

  it("returns a function executes the supplied actor after the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;

    debounce(actor, delay)();
    jest.advanceTimersByTime(delay);

    expect(actor).toHaveBeenCalledTimes(1);
  });

  it("returns a function that executes the actor with the supplied arguemtns.", () => {
    const args: Args =  [1, "2", { id: 3 }];
    const actor = jest.fn<void, Args>();
    const delay = 500;

    debounce(actor, delay)(...args);
    jest.advanceTimersByTime(delay);

    expect(actor).toHaveBeenCalledWith(...args);
  });

  it("returns a function that will not execute the actor twice within the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;

    const debounced = debounce(actor, delay);
    debounced();
    jest.advanceTimersByTime(delay - 1);
    debounced();
    jest.advanceTimersByTime(1);

    expect(actor).toHaveBeenCalledTimes(1);
  });

  it("returns a function that executes the actor with the most recent arguments.", () => {
    const actor = jest.fn<void, Args>();
    const delay = 500;

    const debounced = debounce(actor, delay);
    debounced(1, "2", { id: 3 });
    jest.advanceTimersByTime(delay - 1);
    const laastrgs: Args = [4, "5", { id: 6 }];
    debounced(...laastrgs);
    jest.advanceTimersByTime(1);

    expect(actor).toHaveBeenCalledWith(...laastrgs);
  });

  it("returns a function that executes the actor once after the given delay even if it has been called more than once within the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;
    const debounced = debounce(actor, delay);

    debounced();
    jest.advanceTimersByTime(delay / 2);
    debounced();
    jest.advanceTimersByTime(delay / 2 - 1);
    debounced();
    jest.advanceTimersByTime(1);

    expect(actor).toHaveBeenCalledTimes(1);
  });

  it("returns a function that, if called since the  actor has been executed, will schedule another delayed execution.", () => {
    const actor = jest.fn();
    const delay = 500;
    const debounced = debounce(actor, delay);

    debounced();
    jest.advanceTimersByTime(delay);
    debounced();
    jest.advanceTimersByTime(delay - 1);
    debounced();
    jest.advanceTimersByTime(1);

    expect(actor).toHaveBeenCalledTimes(2);
  });
});