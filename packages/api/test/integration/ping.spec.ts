import { useServer } from "../server";
import { fetchOK } from "../fetch";

describe("hello world", () => {
  useServer();

  it("returns 'pong' from a GET on '/ping'", async () => {
    const result = await fetchOK("/ping").then((response) => {
      try {
        return response.json();
      } catch {
        return response.text();
      }
    });

    expect(result).toBe("pong");
  });
});
