import log from "./log";

describe("log", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("info", () => {
    it("passes arguments to console.log", () => {
      const args = [1, "2", { id: 3 }];
      log.info(...args);

      // console.log call verified in test.
      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith(...args);
    });
  });
});