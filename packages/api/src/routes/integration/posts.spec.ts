import { useServer } from "../../../test/server";
import { fetch, Verbs } from "../../../test/fetch";

describe("/posts", () => {
  useServer();

  it("returns an empty manifest if no posts have been added.", async () => {
    const result = await fetch("/posts", { method: Verbs.GET })
      .then((response) => response.json());

    expect(result).toStrictEqual({});
  });
});
