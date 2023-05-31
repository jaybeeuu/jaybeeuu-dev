import type { ImageDetails } from "../images";

export interface ImageInstance {
  width: number;
  path: string;
}

export class ImageLoader {
  #name: string;
  #currentBest: ImageInstance;
  #listeners: ((image: ImageInstance) => void)[] = [];

  constructor(
    imageDetails: ImageDetails
  ) {
    this.#name = imageDetails.alt;
    this.#currentBest = {
      width: 0,
      path: imageDetails.placeholder
    };

    void this.startLoading(imageDetails);
  }

  get currentBest(): ImageInstance {
    return this.#currentBest;
  }

  subscribe(callback: (image: ImageInstance) => void): () => void {
    this.#listeners.push(callback);
    callback(this.#currentBest);

    return () => {
      this.#listeners = this.#listeners.filter((listener) => listener === callback);
    };
  }

  private async startLoading(imageDetails: ImageDetails): Promise<void> {
    const images = imageDetails.images
      .sort((left, right) => left.width - right.width)
      .map(({ path, width }) => ({
        path,
        width,
        promise: fetch(path).then((response) => response.blob())
      }));

    for (const image of images) {
      await image.promise;
      this.#currentBest = image;
      this.#listeners.forEach((listener) => listener(image));
    }
  }
}
