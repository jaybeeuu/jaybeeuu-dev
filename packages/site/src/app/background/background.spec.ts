import { ControllablePromise } from "@jaybeeuu/utilities/test";
import type { RenderHookResult } from "@testing-library/preact";
import { act, renderHook, waitFor } from "@testing-library/preact";
import type { ImageDetails, ImageLoader } from "../images";
import { images } from "../images";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import type { ImageState } from "./background";
import { useImages } from "./background";
import type { ImageInstance } from "../images/image-loader";

jest.mock("../images");

class MockImageLoader implements ImageLoader {
  get currentBest(): ImageInstance {
    return { path: "{currrent-best-path}", width: 0 };
  }
  subscribe(): () => void {
    return () => {};
  }
}

const makeImageDetails = (image: string): ImageDetails => ({
  src: `${String(image)}-src`,
  srcSet: `${String(image)}-srcSet`,
  placeholder: `${String(image)}-placeholder`,
  images: [{
    path: `${String(image)}-path`,
    width: 100,
    height: 100
  }],
  loader: new MockImageLoader(),
  width: 100,
  height: 100,
  alt: `${String(image)}-alt`
});

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

  it("returns null when the light theme has been selected but the promise hasn't resolved yet.", () => {
    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    });

    expect(result.current).toStrictEqual({ current: null, previous: null });
  });

  it("returns null when the dark theme has been selected but the promise hasn't resolved yet.", () => {
    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    });

    expect(result.current).toStrictEqual({ current: null, previous: null });
  });

  it(
    "returns the light image as current when the light theme is selected after the promise resolves.",
    async () => {
      const promise = new ControllablePromise<ImageDetails>();
      jest.mocked(images["black-tusk"]).mockReturnValue(promise);

      const { result } = renderUseImages({
        backgrounds: {
          dark: "bath",
          light: "black-tusk"
        },
        currentTheme: "light"
      });

      const blackTusk = makeImageDetails("black-tusk");
      await act(() => promise.resolve(blackTusk));

      await waitFor(() => expect(result.current).toStrictEqual({
        current: blackTusk,
        previous: null
      }));
    }
  );

  it("returns the dark image as current when the dark theme is selected.", async () => {
    const promise = new ControllablePromise<ImageDetails>();
    jest.mocked(images.bath).mockReturnValue(promise);

    const { result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    });

    const bath = makeImageDetails("bath");
    await act(() => promise.resolve(bath));

    await waitFor(() => expect(result.current).toStrictEqual({
      current: bath,
      previous: null
    }));
  });

  it("sets the previous and current images when the images change.", async() => {
    const blackTusk = makeImageDetails("black-tusk");
    jest.mocked(images["black-tusk"]).mockResolvedValue(blackTusk);
    const christmasTrail = makeImageDetails("christmas-trail");
    jest.mocked(images["christmas-trail"]).mockResolvedValue(christmasTrail);

    const { rerender, result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "light"
    });

    await waitFor(() => expect(result.current).toStrictEqual({
      current: blackTusk,
      previous: null
    }));

    rerender({
      backgrounds: {
        dark: "crabapple-drive",
        light: "christmas-trail"
      },
      currentTheme: "light"
    });

    await waitFor(() => expect(result.current).toStrictEqual({
      current: christmasTrail,
      previous: blackTusk
    }));
  });

  it("sets the previous and current images when the theme changes.", async () => {
    const blackTusk = makeImageDetails("black-tusk");
    jest.mocked(images["black-tusk"]).mockResolvedValue(blackTusk);
    const bath = makeImageDetails("bath");
    jest.mocked(images.bath).mockResolvedValue(bath);

    const { rerender, result } = renderUseImages({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "light"
    });

    await waitFor(() => expect(result.current).toStrictEqual({
      current: blackTusk,
      previous: null
    }));

    rerender({
      backgrounds: {
        dark: "bath",
        light: "black-tusk"
      },
      currentTheme: "dark"
    });

    await waitFor(() => expect(result.current).toStrictEqual({
      current: bath,
      previous: blackTusk
    }));
  });
});
