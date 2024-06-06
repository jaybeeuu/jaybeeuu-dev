import { ControllablePromise } from "@jaybeeuu/utilities/test";
import type { RenderHookResult } from "@testing-library/preact";
import { act, renderHook, waitFor } from "@testing-library/preact";
import { images } from "../images";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import type { ImageState } from "./background";
import { useImages } from "./background";

import { describe, expect, it, jest } from "@jest/globals";
jest.mock("../images");
interface UseImagesProps {
  backgrounds: BackgroundImages | null;
  currentTheme: Theme;
}

const renderUseImages = (
  initialProps: UseImagesProps,
): RenderHookResult<ImageState, UseImagesProps> => {
  return renderHook(
    ({ backgrounds, currentTheme }) => useImages(backgrounds, currentTheme),
    { initialProps },
  );
};

describe("useImages", () => {
  it("returns null in the current image if there are no images.", () => {
    const { result } = renderUseImages({
      backgrounds: null,
      currentTheme: "light",
    });

    expect(result.current).toStrictEqual({ current: null, previous: null });
  });

  it("returns null when the light theme has been selected but the promise hasn't resolved yet.", () => {
    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk",
      },
      currentTheme: "dark",
    });

    expect(result.current).toStrictEqual({ current: null, previous: null });
  });

  it("returns null when the dark theme has been selected but the promise hasn't resolved yet.", () => {
    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk",
      },
      currentTheme: "dark",
    });

    expect(result.current).toStrictEqual({ current: null, previous: null });
  });

  it("returns the light image as current when the light theme is selected after the promise resolves.", async () => {
    const promise = new ControllablePromise<Response>();
    jest.spyOn(window, "fetch").mockReturnValue(promise);

    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk",
      },
      currentTheme: "light",
    });

    await act(() => {
      promise.resolve({} as Response);
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        current: images["black-tusk"],
        previous: null,
      });
    });
  });

  it("returns the dark image as current when the dark theme is selected.", async () => {
    const promise = new ControllablePromise<Response>();
    jest.spyOn(window, "fetch").mockReturnValue(promise);

    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk",
      },
      currentTheme: "dark",
    });

    await act(() => {
      promise.resolve({} as Response);
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        current: images["bath"],
        previous: null,
      });
    });
  });

  it("sets the previous and current images when the images change.", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue({} as Response);

    const { rerender, result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk",
      },
      currentTheme: "light",
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        current: images["black-tusk"],
        previous: null,
      });
    });

    rerender({
      backgrounds: {
        dark: "crabapple-drive",
        light: "christmas-trail",
      },
      currentTheme: "light",
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        current: images["christmas-trail"],
        previous: images["black-tusk"],
      });
    });
  });

  it("sets the previous and current images when the theme changes.", async () => {
    jest.spyOn(window, "fetch").mockResolvedValue({} as Response);

    const { rerender, result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk",
      },
      currentTheme: "light",
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        current: images["black-tusk"],
        previous: null,
      });
    });

    rerender({
      backgrounds: {
        dark: "bath",
        light: "black-tusk",
      },
      currentTheme: "dark",
    });

    await waitFor(() => {
      expect(result.current).toStrictEqual({
        current: images["bath"],
        previous: images["black-tusk"],
      });
    });
  });
});
