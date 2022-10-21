import type { Image} from "../images/index";
import { imageUrls } from "../images/index";

export interface ImageStateEntry {
  name: Image;
  alt: string;
  loaded: boolean;
  url: string;
}

export interface ImageState {
  current: ImageStateEntry | null;
  previous: ImageStateEntry | null;
}

export type ImageUpdateCallback = (images: ImageState) => void;

export class ImagePreloader {
  #state: ImageState = {
    current: null,
    previous: null
  };
  readonly #onImageStatusChanged: ImageUpdateCallback;
  #abort: () => void = () => {};

  public constructor(imageUpdateCallback: ImageUpdateCallback) {
    this.#onImageStatusChanged = imageUpdateCallback;
  }

  public updateImage(image: Image | null): ImageState {
    if (image === this.#state.current?.name) {
      return this.#state;
    }

    this.#state = {
      previous: this.#state.current,
      current: image === null ? null : {
        name: image,
        alt: image,
        url: imageUrls[image],
        loaded: false
      }
    };

    void this.#preloadCurrent();

    return this.#state;
  }

  #emit(): void {
    this.#onImageStatusChanged(this.#state);
  }

  async #preloadCurrent(): Promise<void> {
    if (!this.#state.current) {
      return;
    }

    try {
      const abortController = new AbortController();
      this.#abort = () => abortController.abort();
      await fetch(this.#state.current?.url, { signal: abortController.signal });
      this.#state = {
        ...this.#state,
        current: { ...this.#state.current, loaded: true }
      };
      this.#emit();
    } catch (error){
      return;
    }
  }
}
