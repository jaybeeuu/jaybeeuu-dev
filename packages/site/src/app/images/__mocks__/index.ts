import type { ImageDetails } from "../index";

const cachedImages: { [key: string]: ImageDetails | undefined } = {};

const handler: ProxyHandler<{ [key: string]: ImageDetails }> = {
  get(target, prop) {
    const image = String(prop);
    if (!cachedImages[image]) {
      cachedImages[image] = {
        src: `${String(image)}-src`,
        srcSet: `${String(image)}-srcSet`,
        placeholder: `${String(image)}-placeholder`,
        images: [{
          path: `${String(image)}-path`,
          width: 100,
          height: 100
        }],
        width: 100,
        height: 100,
        alt: `${String(image)}-alt`
      };
    }
    return cachedImages[image];
  }
};

export const images = new Proxy({}, handler);
