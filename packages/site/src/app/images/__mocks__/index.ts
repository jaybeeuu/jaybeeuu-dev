import type { ImageDetails } from "../index";

const cachedImages: {
  [key: string]: (() => Promise<ImageDetails>) | undefined;
} = {};

const handler: ProxyHandler<{ [key: string]: () => Promise<ImageDetails> }> = {
  get(target, prop) {
    const image = String(prop);
    if (!cachedImages[image]) {
      cachedImages[image] = jest.fn().mockReturnValue(
        Promise.resolve<ImageDetails>({
          src: `${String(image)}-src`,
          placeholder: `${String(image)}-placeholder`,
          position: `${String(image)}-position`,
          alt: `${String(image)}-alt`,
        })
      );
    }
    return cachedImages[image];
  },
};

export const images = new Proxy({}, handler);
