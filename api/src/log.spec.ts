import log from "./log";

describe("log", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("info", () => {
    it("passes arguments to console.log", () => {
      const args = [1, "2", { id: 3 }];
      log.info(...args)

      expect(console.log).toHaveBeenCalledWith(...args);
    });
  });
});