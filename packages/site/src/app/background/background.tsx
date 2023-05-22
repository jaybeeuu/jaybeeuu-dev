import { useAsyncGenerator, useIsMounted, useSemanticMemo } from "@jaybeeuu/preact-async";
import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { CSSTransition } from "preact-transitioning";
import { useEffect, useState } from "preact/hooks";
import type { ImageDetails} from "../images";
import { images } from "../images";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import { backgroundImages, onMainContentScroll, theme } from "../state";
import css from "./background.module.css";

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
  const isMounted = useIsMounted();
  const [imageState, setImageState] = useState<ImageState>({
    previous: null,
    current: null
  });

  useEffect(() => {
    void (async () => {
      const current = backgrounds?.[currentTheme];
      const currentImage: ImageDetails | null = current
        ? await images[current]()
        : null;

      if (isMounted.current) {
        setImageState({
          previous: imageState.current,
          current: currentImage ?? null
        });
      }
    })();
  }, [currentTheme, backgrounds]);

  return imageState;
};

const ProgressiveImage = ({
  alt,
  className,
  images: imgs,
  placeholder,
  position = "50% 100%"
}: { className?: string; } & ImageDetails
): JSX.Element => {
  const pathIterator = useSemanticMemo(() => (async function* () {
    for (const { path } of imgs.sort((left, right) => left.width - right.width)) {
      await fetch(path);
      yield path;
    }
  })(), [images]);
  const path = useAsyncGenerator(pathIterator, null);
  return (
    <div
      className={classNames(css.backgroundPicture, className)}
      style={{
        backgroundImage: `url(${placeholder})`,
        backgroundPosition: position
      }}
    >
      {path ? (
        <img
          alt={alt}
          className={css.backgroundImage}
          src={path}
          style={{ objectPosition: position }}
        />
      ) : null}
    </div>
  );
};

export const Background = ({ children, className }: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [backgrounds] = useValue(backgroundImages);
  const onScroll = useAction(onMainContentScroll);
  const { current, previous } = useImages(
    backgrounds,
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
              enterDone: css.opaque
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
