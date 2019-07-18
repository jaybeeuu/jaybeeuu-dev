import preload from "./preload";

describe("preload", () => {
  beforeEach(() => {
    window.fetch = jest.fn();
  });

  it("requests each of the urls parsed to it.", () => {
    const urls = [1, "2", { id: "3" }];

    preload(...urls);

    expect(window.fetch.mock.calls).toEqual(urls.map(url => [url]));
  });
});