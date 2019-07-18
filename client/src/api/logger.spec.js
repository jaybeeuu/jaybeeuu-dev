import log from "./logger";

describe("logger", () => {
  describe("log", () => {
    it("Passes everything onto the console log function.", () => {
      jest.spyOn(console, "log").mockImplementation(() => {});

      const args = [1, "2", { id: 3 }];

      log(args);

      // eslint-disable-next-line no-console
      expect(console.log).toHaveBeenCalledWith(args);
    });
  });
});
