export interface ImageInstance {
  width: number;
  path: string;
}

export interface ImageLoader {
  readonly currentBest: ImageInstance;
  subscribe: (callback: (image: ImageInstance) => void) => () => void;
}

export class FetchImageLoader implements ImageLoader {
  readonly #imageDetails: ResponsiveImageOutput;

  #currentBest: ImageInstance;
  #listeners: ((image: ImageInstance) => void)[] = [];
  #hasLoaded: boolean = false;

  constructor(
    imageDetails: ResponsiveImageOutput
  ) {
    this.#currentBest = {
      width: 0,
      path: imageDetails.placeholder
    };
    this.#imageDetails = imageDetails;
  }

  get currentBest(): ImageInstance {
    return this.#currentBest;
  }

  subscribe(callback: (image: ImageInstance) => void): () => void {
    if (!this.#hasLoaded) {
      void this.startLoading();
      this.#hasLoaded = true;
    }

    this.#listeners.push(callback);
    callback(this.#currentBest);

    return () => {
      this.#listeners = this.#listeners.filter((listener) => listener === callback);
    };
  }

  private async startLoading(): Promise<void> {
    const images = this.#imageDetails.images
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
