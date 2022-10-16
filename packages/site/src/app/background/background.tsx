import { usePromise } from "@jaybeeuu/preact-async";
import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import type { PromiseStatus } from "@jaybeeuu/utilities";
import classNames from "classnames";
import type { ComponentChildren, JSX } from "preact";
import { CSSTransition } from "preact-transitioning";
import { h } from "preact";
import { useRef } from "preact/hooks";
import type { Theme } from "../services/theme";
import type { BackgroundImages , Image } from "../state";
import { backgroundImages, onMainContentScroll, theme  } from "../state";
import css from "./background.module.css";
import { imageUrls } from "./images";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

const usePreload = (
  image: Image | null
): PromiseStatus => {
  const url = image ? imageUrls[image] : null;

  const status = usePromise(({ abortSignal }): Promise<unknown> => {
    if (!url) {
      return Promise.resolve();
    }
    return fetch(url, { signal: abortSignal });
  }, [url]).promiseState.status;

  return status;
};

export interface ImageEntry {
  alt: string;
  loaded: boolean;
  url: string;
}

const useImage = (
  image: Image | null
): ImageEntry | null => {
  const loadStatus = usePreload(image);

  return image ? {
    alt: image,
    loaded: loadStatus === "complete",
    url: imageUrls[image]
  } : null;
};

export const useImages = (
  images: BackgroundImages | null,
  currentTheme: Theme
): { current: ImageEntry | null, previous: ImageEntry | null } => {
  const current = useImage(images?.[currentTheme] ?? null);
  const state = useRef<{ current: ImageEntry | null, previous: ImageEntry | null }>({
    current,
    previous: null
  });

  if (state.current.current?.url !== current?.url
    || !state.current.previous && current?.loaded) {
    state.current.previous = state.current.current;
  }

  state.current.current = current;
  return state.current;
};

export const Background = ({ children, className }: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [images] = useValue(backgroundImages);
  const onScroll = useAction(onMainContentScroll);
  const { current, previous} = useImages(
    images,
    currentTheme
  );

  return (
    <div className={classNames(className, css.componentRoot)}>
      <div>
        {current ? (
          <CSSTransition
            in={current.loaded}
            classNames={{
              appear: css.transparentIn,
              appearActive: css.opaque,
              appearDone: css.opaque,
              enter: css.transparentIn,
              enterActive: css.opaque,
              enterDone: css.opaque
            }}
            appear
            duration={500}
            key={current.url}
          >
            <div
              className={css.backgroundImage}
              style={{ backgroundImage: `url(${current.url})` }}
            />
          </CSSTransition>
        ) : null}
        {previous ? (
          <CSSTransition
            classNames={{
              appearDone: css.opaque,
              enterDone: css.opaque,
              exit: css.opaque,
              exitActive: css.transparentOut
            }}
            exit
            duration={590}
            in={!current?.loaded}
            key={previous.url}
          >
            <div
              className={css.backgroundImage}
              style={{ backgroundImage: `url(${previous.url})` }}
            />
          </CSSTransition>
        ) : null}
      </div>
      <div
        className={css.content}
        onScroll={(event) => {
          onScroll({
            x: event.currentTarget?.scrollLeft,
            y: event.currentTarget?.scrollTop
          });
        }}
      >
        {children}
      </div>
    </div>
  );
};
Background.displayName = "Theme";
