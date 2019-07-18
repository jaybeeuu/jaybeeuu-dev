import debounce from "./debounce";

describe("debounce", () => {
  beforeEach(()=> {
    jest.useFakeTimers();
  });

  it("returns a function that executes the supplied actor immediately.", () => {
    const actor = jest.fn();

    debounce(actor)();

    expect(actor).toHaveBeenCalledTimes(1);
  });

  it("returns a function that will not execute the actor twice within the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;
    const debounced = debounce(actor, delay);

    debounced();

    jest.advanceTimersByTime(delay - 1);

    debounced();

    expect(actor).toHaveBeenCalledTimes(1);
  });

  it("returns a function that executes the actor once after the given delay if it has been called at least once within the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;
    const debounced = debounce(actor, delay);

    debounced();

    jest.advanceTimersByTime(delay / 2);
    debounced();

    jest.advanceTimersByTime(delay / 2 - 1);
    debounced();

    jest.advanceTimersByTime(1);

    expect(actor).toHaveBeenCalledTimes(2);
  });

  it("returns a function that will execute the actor immediately if the delay has lapsed since the first execution.", () => {
    const actor = jest.fn();
    const delay = 500;
    const debounced = debounce(actor, delay);

    debounced();

    jest.advanceTimersByTime(delay);

    debounced();

    expect(actor).toHaveBeenCalledTimes(2);
  });

  it("returns a function that will schedule another execution after another delay if a second execution has occurred.", () => {
    const actor = jest.fn();
    const delay = 500;
    const debounced = debounce(actor, delay);

    debounced();
    jest.advanceTimersByTime(delay / 2);
    debounced();
    jest.advanceTimersByTime(delay);
    debounced();

    expect(actor).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(delay / 2);

    expect(actor).toHaveBeenCalledTimes(3);
  });
});