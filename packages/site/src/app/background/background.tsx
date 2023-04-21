import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { ComponentChildren, JSX } from "preact";
import { CSSTransition } from "preact-transitioning";
import { h } from "preact";
import type { Inputs} from "preact/hooks";
import { useCallback, useRef, useState } from "preact/hooks";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import { backgroundImages, onMainContentScroll, theme  } from "../state";
import css from "./background.module.css";
import type { ImageState } from "./image-preloader";
import { ImagePreloader } from "./image-preloader";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

const useSemanticMemo = <Value,>(factory: () => Value, inputs: Inputs): Value => {
  const previousInputs = useRef(inputs);
  const currentValue = useRef<Value | "__UNSET__">("__UNSET__");
  if (
    currentValue.current === "__UNSET__"
    || inputs.length !== previousInputs.current.length
    || inputs.some((input, index) => input !== previousInputs.current[index])
  ) {
    currentValue.current = factory();
  }

  previousInputs.current = inputs;

  return currentValue.current;
};

const useRerender = (): () => void => {
  const renderCountRef = useRef(0);
  const [, rerender] = useState(0);
  return useCallback(
    () => rerender(++renderCountRef.current),
    []
  );
};

export const useImages = (
  images: BackgroundImages | null,
  currentTheme: Theme
): ImageState => {
  const current = images?.[currentTheme] ?? null;
  const rerender = useRerender();
  const imagePreloader = useSemanticMemo(
    () => new ImagePreloader(rerender),
    [rerender]
  );
  return imagePreloader.setImage(current);
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
            <QuasiImg {...current} />
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
            <QuasiImg {...previous} />
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
