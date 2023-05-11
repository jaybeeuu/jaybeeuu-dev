import { ControllablePromise } from "@jaybeeuu/utilities/test";
import type { RenderHookResult} from "@testing-library/preact";
import { act, renderHook, waitFor } from "@testing-library/preact";
import type { ThemedImages } from "../state";
import type { ImageState } from "./image-preloader";
import { useImages as baseUseImage } from "./background";
import type { ImageUrls } from "../images";

jest.mock("../images");

// eslint-disable-next-line jest/unbound-method, @typescript-eslint/unbound-method
const { objectContaining } = expect;

describe("useImages", () => {
  type Image = "black-tusk" | "whistler";
  type Version = "low-res" | "high-res";
  type Theme = "light" | "dark";
  type Urls = ImageUrls<Image, Version>;

  const defaultUrls: Urls = {
    "black-tusk": {
      "high-res": "https://example.com/black-tusk/high-res.webp",
      "low-res": "https://example.com/black-tusk/low-res.webp"
    },
    whistler: {
      "high-res": "https://example.com/whistler/high-res.webp",
      "low-res": "https://example.com/whistler/low-res.webp"
    }
  };

  interface UseImagesProps {
    images: ThemedImages<Theme, Image> | null,
    currentTheme: Theme,
    urls: Urls,
    versions: Version[]
  }

  const renderUseImages = (
    initialProps: UseImagesProps
  ): RenderHookResult<ImageState<Image, Version>[], UseImagesProps> => renderHook((
    { currentTheme, images, urls, versions }: UseImagesProps
  ) => useImages(images, currentTheme, urls, versions), {
    initialProps
  });

  const useImages = (
    images: ThemedImages<Theme, Image> | null,
    currentTheme: Theme,
    urls: Urls,
    versions: Version[]
  ): ImageState<Image, Version>[] => {
    return baseUseImage(images, currentTheme, urls, versions);
  };

  it("returns null in the current image if there are no images.", () => {
    const { result } = renderUseImages({
      images: null,
      currentTheme: "light",
      urls: defaultUrls,
      versions: ["low-res", "high-res"]
    });

    expect(result.current).toStrictEqual([
      { current: null, previous: null, version: "low-res" },
      { current: null, previous: null, version: "high-res" }
    ]);
  });

  it("returns the light image as current when the light theme is selected.", () => {
    const { result } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "light",
      urls: defaultUrls,
      versions: ["low-res", "high-res"]
    });

    expect(result.current).toStrictEqual([
      {
        current: objectContaining({
          alt: "whistler",
          name: "whistler",
          url: "https://example.com/whistler/low-res.webp"
        }),
        previous: null,
        version: "low-res"
      },
      {
        current: objectContaining({
          alt: "whistler",
          name: "whistler",
          url: "https://example.com/whistler/high-res.webp"
        }),
        previous: null,
        version: "high-res"
      }
    ]);
  });

  it("returns the dark image as current when the dark theme is selected.", () => {
    const { result } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: ["low-res", "high-res"]
    });

    expect(result.current).toStrictEqual([
      {
        current: objectContaining({
          alt: "black-tusk",
          name: "black-tusk",
          url: "https://example.com/black-tusk/low-res.webp"
        }),
        previous: null,
        version: "low-res"
      },
      {
        current: objectContaining({
          alt: "black-tusk",
          name: "black-tusk",
          url: "https://example.com/black-tusk/high-res.webp"
        }),
        previous: null,
        version: "high-res"
      }
    ]);
  });

  it("sets loaded to false while the image is preloading.", () => {
    jest.spyOn(global, "fetch").mockReturnValue(new ControllablePromise());
    const { result } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: ["low-res", "high-res"]
    });

    expect(result.current).toStrictEqual([
      {
        current: objectContaining({ loaded: false }),
        previous: null,
        version: "low-res"
      },
      {
        current: objectContaining({ loaded: false }),
        previous: null,
        version: "high-res"
      }
    ]);
  });

  it("sets loaded to true once the low-res image has loaded.", async () => {
    const firstPromise = new ControllablePromise<Response>();
    const secondPromise = new ControllablePromise<Response>();

    jest.spyOn(global, "fetch")
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: ["low-res", "high-res"]
    });

    await act(() => firstPromise.resolve({} as unknown as Response));

    await waitFor(() => expect(result.current).toStrictEqual(expect.arrayContaining([
      {
        current: objectContaining({ loaded: true }),
        previous: null,
        version: "low-res"
      }
    ])));
  });

  it("sets loaded to true once the high-res image has loaded.", async () => {
    const firstPromise = new ControllablePromise<Response>();
    const secondPromise = new ControllablePromise<Response>();

    jest.spyOn(global, "fetch")
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: ["low-res", "high-res"]
    });

    await act(() => secondPromise.resolve({} as unknown as Response));

    await waitFor(() => expect(result.current).toStrictEqual(expect.arrayContaining([
      {
        current: objectContaining({ loaded: true }),
        previous: null,
        version: "high-res"
      }
    ])));
  });

  it("sets loaded to false for a new current image when the theme changes.", async () => {
    const firstPromise = new ControllablePromise<Response>();
    jest.spyOn(global, "fetch")
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(firstPromise)
      .mockImplementation(() => new ControllablePromise<Response>());

    const versions: Version[] = ["low-res", "high-res"];

    const { result, rerender } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: versions
    });

    await act(() => firstPromise.resolve({} as unknown as Response));

    await waitFor(() => result.current);

    rerender({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "light",
      urls: defaultUrls,
      versions: versions
    });

    await waitFor(() => expect(result.current).toStrictEqual([
      objectContaining({ current: {
        loaded: false,
        alt: "whistler",
        name: "whistler",
        url: "https://example.com/whistler/low-res.webp"
      } }),
      objectContaining({ current: {
        loaded: false,
        alt: "whistler",
        name: "whistler",
        url: "https://example.com/whistler/high-res.webp"
      } })
    ]));
  });

  it("sets the previous images when the theme changes.", async () => {
    const firstPromise = new ControllablePromise<Response>();
    jest.spyOn(global, "fetch")
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(firstPromise)
      .mockImplementation(() => new ControllablePromise<Response>());

    const versions: Version[] = ["low-res", "high-res"];

    const { result, rerender } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: versions
    });

    await act(() => firstPromise.resolve({} as unknown as Response));

    await waitFor(() => result.current);

    rerender({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "light",
      urls: defaultUrls,
      versions: versions
    });

    await waitFor(() => expect(result.current).toStrictEqual([
      objectContaining({ previous: {
        loaded: true,
        alt: "black-tusk",
        name: "black-tusk",
        url: "https://example.com/black-tusk/low-res.webp"
      } }),
      objectContaining({ previous: {
        loaded: true,
        alt: "black-tusk",
        name: "black-tusk",
        url: "https://example.com/black-tusk/high-res.webp"
      } })
    ]));
  });

  it("sets loaded to false for a new current image when the image changes.", async () => {
    const firstPromise = new ControllablePromise<Response>();
    jest.spyOn(global, "fetch")
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(firstPromise)
      .mockImplementation(() => new ControllablePromise<Response>());

    const versions: Version[] = ["low-res", "high-res"];

    const { result, rerender } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: versions
    });

    await act(() => firstPromise.resolve({} as unknown as Response));

    await waitFor(() => result.current);

    rerender({
      images: { dark: "whistler", light: "black-tusk" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: versions
    });

    await waitFor(() => expect(result.current).toStrictEqual([
      objectContaining({ current: {
        loaded: false,
        alt: "whistler",
        name: "whistler",
        url: "https://example.com/whistler/low-res.webp"
      } }),
      objectContaining({ current: {
        loaded: false,
        alt: "whistler",
        name: "whistler",
        url: "https://example.com/whistler/high-res.webp"
      } })
    ]));
  });

  it("sets the previous images when the image changes.", async () => {
    const firstPromise = new ControllablePromise<Response>();
    jest.spyOn(global, "fetch")
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(firstPromise)
      .mockImplementation(() => new ControllablePromise<Response>());

    const versions: Version[] = ["low-res", "high-res"];

    const { result, rerender } = renderUseImages({
      images: { dark: "black-tusk", light: "whistler" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: versions
    });

    await act(() => firstPromise.resolve({} as unknown as Response));

    await waitFor(() => result.current);

    rerender({
      images: { dark: "whistler", light: "black-tusk" },
      currentTheme: "dark",
      urls: defaultUrls,
      versions: versions
    });

    await waitFor(() => expect(result.current).toStrictEqual([
      objectContaining({ previous: {
        loaded: true,
        alt: "black-tusk",
        name: "black-tusk",
        url: "https://example.com/black-tusk/low-res.webp"
      } }),
      objectContaining({ previous: {
        loaded: true,
        alt: "black-tusk",
        name: "black-tusk",
        url: "https://example.com/black-tusk/high-res.webp"
      } })
    ]));
  });
});
