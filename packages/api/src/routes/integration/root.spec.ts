import { isRoute } from "../../../test/server";

describe("hello world", () => {
  isRoute((get) => {
    it("returns 'Hello, World!' from a GET '/'", async () => {
      const result = await get("/");
      expect(result).toBe("\"Hello, World!\"");
    });
  });
});