import { debounce } from "./debounce.js";

import { describe, expect, it, jest } from "@jest/globals";
jest.useFakeTimers();
type Args = [number, string, { id: number }];

describe("debounce", () => {
  it("does not execute the supplied actor within the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;

    debounce(actor, delay)();
    jest.advanceTimersByTime(delay - 1);

    expect(actor).toHaveBeenCalledTimes(0);
  });

  it("executes the supplied actor after the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;

    debounce(actor, delay)();
    jest.advanceTimersByTime(delay);

    expect(actor).toHaveBeenCalledTimes(1);
  });

  it("executes the actor with the supplied arguments.", () => {
    const args: Args = [1, "2", { id: 3 }];
    const actor = jest.fn<(...ars: Args) => never>();
    const delay = 500;

    debounce(actor, delay)(...args);
    jest.advanceTimersByTime(delay);

    expect(actor).toHaveBeenCalledWith(...args);
  });

  it("will not execute the actor twice within the specified delay.", () => {
    const actor = jest.fn();
    const delay = 500;

    const debounced = debounce(actor, delay);
    debounced();
    jest.advanceTimersByTime(delay - 1);
    debounced();
    jest.advanceTimersByTime(1);

    expect(actor).toHaveBeenCalledTimes(1);
  });

  it("executes the actor with the most recent arguments.", () => {
    const actor = jest.fn<(...ars: Args) => never>();
    const delay = 500;

    const debounced = debounce(actor, delay);
    debounced(1, "2", { id: 3 });
    jest.advanceTimersByTime(delay - 1);
    const laastrgs: Args = [4, "5", { id: 6 }];
    debounced(...laastrgs);
    jest.advanceTimersByTime(1);

    expect(actor).toHaveBeenCalledWith(...laastrgs);
  });

  it("executes the actor once after the given delay even if it has been called more than once within the specified delay.", () => {
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

  it("will schedule another delayed execution if called since the actor has been executed, .", () => {
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

  describe("leading: true", () => {
    it("executes immediately.", () => {
      const actor = jest.fn();
      debounce(actor, { delay: 500, leading: true })();
      expect(actor).toHaveBeenCalledTimes(1);
    });

    it("does not execute again if called within the delay.", () => {
      const actor = jest.fn();
      const delay = 500;
      const debounced = debounce(actor, { delay, leading: true });

      debounced();
      jest.advanceTimersByTime(delay - 1);
      debounced();
      expect(actor).toHaveBeenCalledTimes(1);
    });

    it("executes again after the delay if called within the delay.", () => {
      const actor = jest.fn();
      const delay = 500;
      const debounced = debounce(actor, { delay, leading: true });

      debounced();
      jest.advanceTimersByTime(delay - 1);
      debounced();
      jest.advanceTimersByTime(1);
      expect(actor).toHaveBeenCalledTimes(2);
    });

    it("doesn't execute again after the delay if not called within the delay.", () => {
      const actor = jest.fn();
      const delay = 500;
      const debounced = debounce(actor, { delay, leading: true });

      debounced();
      jest.advanceTimersByTime(delay);
      expect(actor).toHaveBeenCalledTimes(1);
    });

    it("execute immediately again if not called within the delay.", () => {
      const actor = jest.fn();
      const delay = 500;
      const debounced = debounce(actor, { delay, leading: true });

      debounced();
      jest.advanceTimersByTime(delay);
      debounced();
      expect(actor).toHaveBeenCalledTimes(2);
    });
  });
});
