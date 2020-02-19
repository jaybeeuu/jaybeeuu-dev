import { describeRoute } from "../../../test/integration";

describeRoute("Hello world", (get) => () => {
  it("returns 'Hello, World!' from a GET '/' ", async () => {
    const result = await get("/");
    expect(result).toBe("\"Hello, World!\"");
  });
});
