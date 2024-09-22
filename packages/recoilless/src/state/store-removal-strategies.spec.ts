import { withFakeTimers } from "@jaybeeuu/utilities/test";
import { makeScheduler } from "./store-removal-strategies";

import { describe, expect, it, jest } from "@jest/globals";

describe("makeScheduler", () => {
  describe("synchronous", () => {
    it("immediately calls the removal callback.", () => {
      const removeFromStore = jest.fn();
      const { schedule } = makeScheduler(
        { schedule: "synchronous" },
        removeFromStore,
      );

      schedule();

      expect(removeFromStore).toHaveBeenCalledWith();
    });
  });

  describe("delayed", () => {
    withFakeTimers();

    it("does not immediately call the removal callback.", () => {
      const removeFromStore = jest.fn();
      const { schedule } = makeScheduler(
        { schedule: "delayed", delay: 100 },
        removeFromStore,
      );

      schedule();
      jest.advanceTimersByTime(99);

      expect(removeFromStore).not.toHaveBeenCalledWith();
    });

    it("calls the callback after the delay.", () => {
      const removeFromStore = jest.fn();
      const { schedule } = makeScheduler(
        { schedule: "delayed", delay: 100 },
        removeFromStore,
      );

      schedule();

      jest.advanceTimersByTime(100);

      expect(removeFromStore).toHaveBeenCalledWith();
    });

    it("does not call the callback if unscheduled before the delay.", () => {
      const removeFromStore = jest.fn();
      const { schedule, unschedule } = makeScheduler(
        { schedule: "delayed", delay: 100 },
        removeFromStore,
      );

      schedule();
      unschedule();
      jest.advanceTimersByTime(100);

      expect(removeFromStore).not.toHaveBeenCalledWith();
    });

    it("only call the callback once if rescheduled during the delay.", () => {
      const removeFromStore = jest.fn();
      const { schedule } = makeScheduler(
        { schedule: "delayed", delay: 100 },
        removeFromStore,
      );

      schedule();
      schedule();

      jest.advanceTimersByTime(100);

      expect(removeFromStore).toHaveBeenCalledTimes(1);
    });
  });
});
