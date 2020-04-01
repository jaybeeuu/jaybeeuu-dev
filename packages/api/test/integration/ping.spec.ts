import { useServer } from "../server";
import { fetch } from "../fetch";

describe("hello world", () => {
  useServer();

  it("returns 'pong' from a GET on '/ping'", async () => {
    const result = await fetch("/ping").then((response) => response.json());

    expect(result).toBe("pong");
  });
});
