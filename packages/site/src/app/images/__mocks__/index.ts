import type { ImageInstance } from "../image-loader";
import type { ImageDetails, ImageLoader } from "../index";

const cachedImages: { [key: string]: (() => Promise<ImageDetails>) | undefined } = {};

class MockImageLoader implements ImageLoader {
  readonly #currentBest: ImageInstance;

  constructor(image: string) {
    this.#currentBest = { path: `{${image}-currrent-best-path}`, width: 0 };
  }

  get currentBest(): ImageInstance {
    return this.#currentBest;
  }

  subscribe(): () => void {
    return () => {};
  }
}

const handler: ProxyHandler<{ [key: string]: () => Promise<ImageDetails> }> = {
  get(target, prop) {
    const image = String(prop);
    if (!cachedImages[image]) {
      cachedImages[image] = jest.fn().mockReturnValue(Promise.resolve<ImageDetails>({
        src: `${String(image)}-src`,
        srcSet: `${String(image)}-srcSet`,
        placeholder: `${String(image)}-placeholder`,
        images: [{
          path: `${String(image)}-path`,
          width: 100,
          height: 100
        }],
        loader: new MockImageLoader(image),
        width: 100,
        height: 100,
        alt: `${String(image)}-alt`
      }));
    }
    return cachedImages[image];
  }
};

export const images = new Proxy({}, handler);
