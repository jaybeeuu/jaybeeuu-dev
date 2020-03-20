import { useServer } from "../../../test/server";
import { fetch } from "../../../test/fetch";

describe("hello world", () => {
  useServer();

  it("returns 'Hello, World!' from a GET on '/'", async () => {
    const result = await fetch("/").then((response) => response.json());

    expect(result).toBe("Hello, World!");
  });
});
