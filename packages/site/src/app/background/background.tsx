import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { CSSTransition } from "preact-transitioning";
import { useEffect, useState } from "preact/hooks";
import type { Image } from "../images";
import { imageUrls } from "../images";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import { backgroundImages, onMainContentScroll, theme } from "../state";
import css from "./background.module.css";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

export interface ImageStateEntry {
  name: Image;
  alt: string;
  url: string;
}

export interface ImageState {
  current: ImageStateEntry | null;
  previous: ImageStateEntry | null;
}

export const useImages = (
  images: BackgroundImages | null,
  currentTheme: Theme
): ImageState => {
  const [imageState, setImageState] = useState<ImageState>({
    previous: null,
    current: null
  });

  useEffect(() => {
    const current = images?.[currentTheme];
    setImageState({
      previous: imageState.current,
      current: current ? {
        name: current,
        alt: current,
        url: imageUrls[current]
      } : null
    });
  }, [currentTheme, images]);

  return imageState;
};

const QuasiImg = ({
  alt,
  className,
  url
}: {
  alt: string;
  className?: string;
  url: string;
}): JSX.Element => {
  return (
    <div
      className={classNames(css.backgroundImage, className)}
      role="img"
      aria-label={alt}
      style={{ backgroundImage: `url(${url})` }}
    />
  );
};

export const Background = ({ children, className }: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [images] = useValue(backgroundImages);
  const onScroll = useAction(onMainContentScroll);
  const { current, previous } = useImages(
    images,
    currentTheme
  );

  return (
    <div className={classNames(className, css.componentRoot)}>
      <div>
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
            in={!current}
            key={previous.url}
          >
            <QuasiImg {...previous} />
          </CSSTransition>
        ) : null}
        {current ? (
          <CSSTransition
            in={!!current}
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
            <QuasiImg {...current} />
          </CSSTransition>
        ) : null}
      </div>
      <div
        className={css.content}
        onScroll={(event) => {
          onScroll({
            x: event.currentTarget.scrollLeft,
            y: event.currentTarget.scrollTop
          });
        }}
      >
        {children}
      </div>
    </div>
  );
};
Background.displayName = "Theme";
