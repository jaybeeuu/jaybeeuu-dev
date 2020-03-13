import { isRoute } from "../../../test/integration";

describe("/posts", () => {
  isRoute((get) => {
    it("returns an empty manifest if no posts have been added.", async () => {
      const result = await get("/posts");
      expect(JSON.parse(result)).toStrictEqual({});
    });
  });
});
