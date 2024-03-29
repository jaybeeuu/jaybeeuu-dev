import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { CSSTransition } from "preact-transitioning";
import { useEffect, useState } from "preact/hooks";
import type { ImageDetails } from "../images";
import { images } from "../images";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import { backgroundImages, onMainContentScroll, theme } from "../state";
import css from "./background.module.css";
import { ProgressiveImage } from "./progressive-image";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}
export interface ImageState {
  current: ImageDetails | null;
  previous: ImageDetails | null;
}

export const useImages = (
  backgrounds: BackgroundImages | null,
  currentTheme: Theme
): ImageState => {
  const [imageState, setImageState] = useState<ImageState>({
    previous: null,
    current: null,
  });

  useEffect(() => {
    const currentName = backgrounds?.[currentTheme];
    if (!currentName) {
      return;
    }

    const current = images[currentName];

    setImageState({ previous: imageState.current, current });
  }, [currentTheme, backgrounds]);

  return imageState;
};

export const Background = ({
  children,
  className,
}: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [backgrounds] = useValue(backgroundImages);
  const onScroll = useAction(onMainContentScroll);
  const { current, previous } = useImages(backgrounds, currentTheme);

  return (
    <div className={classNames(className, css.componentRoot)}>
      <div>
        {previous ? (
          <CSSTransition
            classNames={{
              appearDone: css.opaque,
              enterDone: css.opaque,
              exit: css.opaque,
              exitActive: css.transparentOut,
            }}
            exit
            duration={500}
            in={!current}
            key={previous.src}
          >
            <ProgressiveImage {...previous} />
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
              enterDone: css.opaque,
            }}
            appear
            duration={500}
            key={current.src}
          >
            <ProgressiveImage {...current} />
          </CSSTransition>
        ) : null}
      </div>
      <div
        className={css.content}
        onScroll={(event) => {
          onScroll({
            x: event.currentTarget.scrollLeft,
            y: event.currentTarget.scrollTop,
          });
        }}
      >
        {children}
      </div>
    </div>
  );
};
Background.displayName = "Background";
