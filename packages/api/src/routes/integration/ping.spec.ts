import { useServer } from "../../../test/server";
import { fetch } from "../../../test/fetch";

describe("hello world", () => {
  useServer();

  it("returns 'pong' from a GET on '/ping'", async () => {
    const result = await fetch("/ping").then((response) => response.json());

    expect(result).toBe("pong");
  });
});
