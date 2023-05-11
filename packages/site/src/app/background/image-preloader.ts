import type { ImageUrls } from "../images/index";

export interface ImageStateEntry<ImageName extends string> {
  name: ImageName;
  alt: string;
  loaded: boolean;
  url: string;
}

export interface ImageState<
  ImageName extends string,
  Version extends string
> {
  current: ImageStateEntry<ImageName> | null;
  previous: ImageStateEntry<ImageName> | null;
  version: Version;
}

export type ImageUpdateCallback<
  ImageName extends string,
  Version extends string
> = (
  images: ImageState<ImageName, Version>
) => void;

export class ImagePreloader<
  ImageName extends string,
  Version extends string
> {
  readonly #onImageStatusChanged: ImageUpdateCallback<ImageName, Version>;
  readonly #preloads = new Set<string>();
  readonly #version: Version;
  readonly #urls: ImageUrls<ImageName, Version>;

  #state: ImageState<ImageName, Version>;

  public constructor(
    version: Version,
    imageUpdateCallback: ImageUpdateCallback<ImageName, Version>,
    urls: ImageUrls<ImageName, Version>
  ) {
    this.#onImageStatusChanged = imageUpdateCallback;
    this.#urls = urls;
    this.#version = version;
    this.#state = {
      current: null,
      previous: null,
      version: this.#version
    };
  }

  public get state(): ImageState<ImageName, Version> {
    return this.#state;
  }

  public setImage(image: ImageName | null): void {
    if (image === this.#state.current?.name) {
      return;
    }

    const isPreloaded = !!image && this.#preloads.has(image);
    this.#state = {
      current: image === null ? null : {
        name: image,
        alt: image,
        url: this.#urls[image][this.#version],
        loaded: isPreloaded
      },
      previous: this.#state.current,
      version: this.#version
    };

    if (!isPreloaded) {
      void this.#preloadCurrent();
    }
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

      this.#preloads.add(current.name);

      this.#emit();
    } catch (error){
      return;
    }
  }
}
