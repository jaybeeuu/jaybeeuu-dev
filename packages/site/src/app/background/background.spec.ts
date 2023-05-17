import type { RenderHookResult} from "@testing-library/preact";
import { renderHook } from "@testing-library/preact";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import type { ImageState} from "./background";
import { useImages } from "./background";
import { images } from "../images";

jest.mock("../images");

interface UseImagesProps {
  backgrounds: BackgroundImages | null;
  currentTheme: Theme;
}

const renderUseImages = (
  initialProps: UseImagesProps
): RenderHookResult<ImageState, UseImagesProps> => {
  return renderHook(
    ({ backgrounds, currentTheme })=> useImages(backgrounds, currentTheme),
    { initialProps }
  );
};

describe("useImages", () => {
  it("returns null in the current image if there are no images.", () => {
    const { result } = renderUseImages({
      backgrounds: null,
      currentTheme: "light"
    });

    expect(result.current).toStrictEqual({ current: null, previous: null });
  });

  it("returns the light image as current when the light theme is selected.", () => {
    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "light"
    });

    expect(result.current).toStrictEqual({
      current: images["black-tusk"],
      previous: null
    });
  });

  it("returns the dark image as current when the dark theme is selected.", () => {
    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    });

    expect(result.current).toStrictEqual({
      current: images.bath,
      previous: null
    });
  });

  it("sets the previous and current images when the images change.", () => {
    const { result, rerender } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    });

    rerender({
      backgrounds: {
        dark: "christmas-trail",
        light: "crabapple-drive"
      },
      currentTheme: "dark"
    });

    expect(result.current).toStrictEqual({
      current: images["christmas-trail"],
      previous: images.bath
    });
  });

  it("sets the previous and current images when the theme changes.", () => {
    const { result, rerender } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    });

    rerender({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "light"
    });

    expect(result.current).toStrictEqual({
      current: images["black-tusk"],
      previous: images.bath
    });
  });
});
