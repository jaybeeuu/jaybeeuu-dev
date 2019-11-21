import { setupServer, get } from "../../../test/integration";

describe("Hello world", () => {
  setupServer();

  it("returns 'Hello, World!' from a GET '/' ", async () => {
    const result = await get("/");
    expect(result).toBe("Hello, World!");
  });
});
