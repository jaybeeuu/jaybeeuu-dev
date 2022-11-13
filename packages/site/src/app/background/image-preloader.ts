import { Console } from "console";
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
  #preloads: Set<string> = new Set();

  public constructor(imageUpdateCallback: ImageUpdateCallback) {
    this.#onImageStatusChanged = imageUpdateCallback;
  }

  public setImage(image: Image | null): ImageState {
    if (image === this.#state.current?.name) {
      return this.#state;
    }

    const isPreloaded = !!image && this.#preloads.has(image);
    this.#state = {
      previous: this.#state.current,
      current: image === null ? null : {
        name: image,
        alt: image,
        url: imageUrls[image],
        loaded: isPreloaded
      }
    };

    if (!isPreloaded) {
      void this.#preloadCurrent();
    }

    return this.#state;
  }

  #emit(): void {
    this.#onImageStatusChanged(this.#state);
  }

  async #preloadCurrent(): Promise<void> {
    if (!this.#state.current) {
      return;
    }
    const { current } = this.#state;

    try {
      await fetch(current.url);
      this.#state = {
        ...this.#state,
        current: { ...current, loaded: true }
      };

      this.#preloads.add(current?.name);
      this.#emit();
    } catch (error){
      return;
    }
  }
}
