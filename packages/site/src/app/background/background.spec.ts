import { ControllablePromise } from "@jaybeeuu/utilities/test";
import { act, renderHook } from "@testing-library/preact-hooks";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import type { ImageStateEntry } from "./image-preloader";
import { useImages } from "./background";
import { imageUrls } from "../images";

jest.mock("../images");

// eslint-disable-next-line jest/unbound-method, @typescript-eslint/unbound-method
const { objectContaining } = expect;

describe("useImages", () => {
  it("returns null in the current image if there are no images.", () => {
    const { result } = renderHook(() => useImages(null, "light"));

    expect(result.current).toStrictEqual({ current: null, previous: null });
  });

  it("returns the light image as current when the light theme is selected.", () => {
    const { result } = renderHook(() => useImages(
      {
        dark: "bath",
        light: "black-tusk"
      },
      "light"
    ));

    expect(result.current).toStrictEqual({
      current: objectContaining({
        alt: "black-tusk",
        url: imageUrls["black-tusk"]
      }) as ImageStateEntry,
      previous: null
    });
  });

  it("returns the dark image as current when the dark theme is selected.", () => {
    const { result } = renderHook(() => useImages(
      {
        dark: "bath",
        light: "black-tusk"
      },
      "dark"
    ));

    expect(result.current).toStrictEqual({
      current: objectContaining({
        alt: "bath",
        url: imageUrls["bath"]
      }) as ImageStateEntry,
      previous: null
    });
  });

  it("sets loaded to false while the image is preloading.", () => {
    jest.spyOn(global, "fetch").mockReturnValue(new ControllablePromise());
    const { result } = renderHook(() => useImages(
      {
        dark: "bath",
        light: "black-tusk"
      },
      "dark"
    ));

    expect(result.current).toStrictEqual({
      current: objectContaining({
        loaded: false
      }) as ImageStateEntry,
      previous: null
    });
  });

  it("sets loaded to true once the image has loaded.", async () => {
    const fetchPromise = new ControllablePromise<Response>();
    jest.spyOn(global, "fetch").mockReturnValue(fetchPromise);

    const { result, waitForNextUpdate } = renderHook(() => useImages(
      { dark: "bath", light: "black-tusk" },
      "dark"
    ));

    const waitPromise = waitForNextUpdate();
    fetchPromise.resolve({} as unknown as Response);
    await waitPromise;

    expect(result.current).toStrictEqual({
      current: objectContaining({
        loaded: true
      }) as ImageStateEntry,
      previous: null
    });
  });

  it("sets loaded to false for a new current image.", async () => {
    const fetchPromise = new ControllablePromise<Response>();
    jest.spyOn(global, "fetch").mockReturnValue(fetchPromise);

    const { result, rerender, waitForNextUpdate } = renderHook(
      ({ currentTheme, images }: {
        images: BackgroundImages | null;
        currentTheme: Theme;
      } = {
        images: {
          dark: "bath",
          light: "black-tusk"
        },
        currentTheme: "dark"
      }) => useImages(images, currentTheme));

    await act(() => fetchPromise.resolve({} as unknown as Response));

    await waitForNextUpdate();

    rerender({
      images: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "light"
    });

    expect(result.current).toStrictEqual(objectContaining({
      current: objectContaining({
        loaded: false
      }) as ImageStateEntry
    }));
  });

  it("sets the previous and current images when the images change.", () => {
    const { result, rerender } = renderHook(({
      images,
      currentTheme
    }: { images: BackgroundImages | null, currentTheme: Theme } = {
      images: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    }) => useImages(images, currentTheme));

    rerender({
      images: {
        dark: "christmas-trail",
        light: "crabapple-drive"
      },
      currentTheme: "dark"
    });

    expect(result.current).toStrictEqual({
      current: objectContaining({
        alt: "christmas-trail"
      }) as ImageStateEntry,
      previous: objectContaining({
        alt: "bath"
      }) as ImageStateEntry
    });
  });

  it("sets the previous and current images when the theme changes.", () => {
    const { result, rerender } = renderHook(({
      images,
      currentTheme
    }: { images: BackgroundImages | null, currentTheme: Theme } = {
      images: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    }) => useImages(images, currentTheme));

    rerender({
      images: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "light"
    });

    expect(result.current).toStrictEqual({
      current: objectContaining({
        alt: "black-tusk"
      }) as ImageStateEntry,
      previous: objectContaining({
        alt: "bath"
      }) as ImageStateEntry
    });
  });
});
