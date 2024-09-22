import { asError } from "@jaybeeuu/utilities";
import { fetchJson, fetchText } from "./request";

import { describe, expect, it, jest } from "@jest/globals";

describe("fetchJson", () => {
  it("returns the deserialized JSON .", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({ data: "here's some data" }),
    } as Response);

    await expect(fetchJson("http://example.com")).resolves.toStrictEqual({
      data: "here's some data",
    });
  });

  it("throws if the fetch returns a non 200 response.", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Not found",
      text: () => Promise.resolve('{ "error": "unable to find address" }'),
    } as Response);

    await expect(() => fetchJson("http://example.com")).rejects.toStrictEqual(
      asError({
        status: 400,
        statusText: "Not found",
        body: '{ "error": "unable to find address" }',
      }),
    );
  });
});

describe("fetchText", () => {
  it("returns the deserialized JSON .", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: () => Promise.resolve("here's some text"),
    } as Response);

    await expect(fetchText("http://example.com")).resolves.toBe(
      "here's some text",
    );
  });

  it("throws if the fetch returns a non 200 response.", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Not found",
      text: () => Promise.resolve('{ "error": "unable to find address" }'),
    } as Response);

    await expect(() => fetchText("http://example.com")).rejects.toStrictEqual(
      asError({
        status: 400,
        statusText: "Not found",
        body: '{ "error": "unable to find address" }',
      }),
    );
  });
});
