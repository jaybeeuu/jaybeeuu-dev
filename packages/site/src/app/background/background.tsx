import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import type { Inputs } from "preact/hooks";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { ImageUrls, ImageVersion} from "../images";
import { imageUrls } from "../images";
import type { ThemedImages } from "../state";
import { backgroundImages, onMainContentScroll, theme } from "../state";
import css from "./background.module.css";
import type { ImageState } from "./image-preloader";
import { ImagePreloader } from "./image-preloader";
import { ImageSwapper } from "./image-swapper";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

const unset = Symbol.for("UNSET");

const useSemanticMemo = <Value,>(factory: () => Value, inputs: Inputs): Value => {
  const previousInputs = useRef(inputs);
  const currentValue = useRef<Value | typeof unset>(unset);
  if (
    currentValue.current === unset
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

let renderCount = 0;

export const useImages = <
  Image extends string,
  Version extends string,
  Theme extends string
>(
  images: ThemedImages<Theme, Image> | null,
  currentTheme: Theme,
  urls: ImageUrls<Image, Version>,
  versions: Version[]
): ImageState<Image, Version>[] => {
  if (renderCount++ > 100) {
    throw new Error("Too many renders");
  }

  const rerender = useRerender();

  const imagePreloaders = useSemanticMemo(
    () => {
      return versions.map((version) => {
        return new ImagePreloader(version, rerender, urls);
      });
    },
    [versions, rerender, urls]
  );

  useEffect(() => {
    const current = images?.[currentTheme] ?? null;
    imagePreloaders.forEach((preloader) => {
      preloader.setImage(current);
    });
    rerender();
  }, [images, currentTheme, imagePreloaders]);

  const states = imagePreloaders.map((image) => image.state);
  return useSemanticMemo(
    () => states,
    states
  );
};

const versions: ImageVersion[] = ["blurred", "lowRes", "fullRes"];

export const Background = ({
  children,
  className
}: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [images] = useValue(backgroundImages);
  const onScroll = useAction(onMainContentScroll);
  const imageStates = useImages(
    images,
    currentTheme,
    imageUrls,
    versions
  );

  return (
    <div className={classNames(className, css.componentRoot)}>
      {imageStates.map(({ current, previous, version } ) => (
        <ImageSwapper
          key={version}
          current={current}
          previous={previous}
        />
      ))}
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
