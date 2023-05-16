import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { CSSTransition } from "preact-transitioning";
import { useEffect, useState } from "preact/hooks";
import { imageUrls } from "../images";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import { backgroundImages, onMainContentScroll, theme } from "../state";
import css from "./background.module.css";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

export interface ImageStateEntry extends ResponsiveImageOutput {
  alt: string;
}

export interface ImageState {
  current: ImageStateEntry | null;
  previous: ImageStateEntry | null;
}

type TitleCase<Value extends string> = Value extends `${infer Prefix}-${infer Suffix}`
  ? `${Capitalize<Prefix>} ${TitleCase<Suffix>}`
  : Capitalize<Value>;

const titleCase = <Value extends string>(kebabCase: Value): TitleCase<Value> => {
  return kebabCase
    .split("-")
    .map(([first, ...rest]) => [first?.toUpperCase(), ... rest].join(""))
    .join(" ") as TitleCase<Value>;
};

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
    const currentImage: ImageStateEntry | null = current ? {
      alt: titleCase(current),
      ...imageUrls[current]
    } : null;

    setImageState({
      previous: imageState.current,
      current: currentImage ?? null
    });
  }, [currentTheme, images]);

  return imageState;
};

const ResponsiveImage = ({
  alt,
  className,
  height,
  placeholder,
  src,
  srcSet,
  width
}: { className?: string; } & ImageStateEntry
): JSX.Element => {
  return (
    <div
      className={classNames(css.backgroundPicture, className)}
      style={{ backgroundImage: `url(${placeholder})` }}>
      <img
        alt={alt}
        className={css.backgroundImage}
        height={height}
        placeholder={placeholder}
        sizes='(max-width: 600px) 600px, (max-width: 900px) 900px, (max-width: 1200px) 1200px, 1800px'
        src={src}
        srcSet={srcSet}
        width={width}
      />
    </div>
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
            key={previous.src}
          >
            <ResponsiveImage {...previous} />
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
            <ResponsiveImage {...current} />
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
