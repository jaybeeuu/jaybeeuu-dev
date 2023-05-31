import { useIsMounted } from "@jaybeeuu/preact-async";
import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { CSSTransition } from "preact-transitioning";
import { useEffect, useRef, useState } from "preact/hooks";
import type { ImageDetails, ImageName} from "../images";
import { images } from "../images";
import type { Theme } from "../services/theme";
import type { BackgroundImages } from "../state";
import { backgroundImages, onMainContentScroll, theme } from "../state";
import css from "./background.module.css";
import { ImageLoader } from "./image-loader";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

interface ImageStateEntry extends ImageDetails {
  loader: ImageLoader;
}

export interface ImageState {
  current: ImageStateEntry | null;
  previous: ImageStateEntry | null;
}

const getImageStateEntry = async (
  imageName: ImageName | undefined,
  loaders: { [name: string]: ImageLoader }
): Promise<ImageStateEntry | null> => {
  if (!imageName) {
    return null;
  }

  const imageDetails = await images[imageName]();
  const loader = loaders[imageName] ?? new ImageLoader(imageDetails);
  loaders[imageName] = loader;

  return {
    ...imageDetails,
    loader
  };
};

export const useImages = (
  backgrounds: BackgroundImages | null,
  currentTheme: Theme
): ImageState => {
  const isMounted = useIsMounted();
  const [imageState, setImageState] = useState<ImageState>({
    previous: null,
    current: null
  });

  const loaders = useRef<{ [name: string]: ImageLoader; }>({});

  useEffect(() => {
    void (async () => {
      const currentName = backgrounds?.[currentTheme];
      const current = await getImageStateEntry(currentName, loaders.current);

      if (isMounted.current) {
        setImageState({ previous: imageState.current, current });
      }
    })();
  }, [currentTheme, backgrounds]);

  return imageState;
};

const useLoader = (loader: ImageLoader): string => {
  const isMounted = useIsMounted();
  const [path, setPath] = useState(loader.currentBest.path);

  useEffect(() => {
    const unsubscribe = loader.subscribe((image) => {
      if (isMounted.current) {
        setPath(image.path);
      }
    });
    return () => unsubscribe();
  }, [loader]);

  return path;
};

const ProgressiveImage = ({
  alt,
  className,
  loader,
  placeholder,
  position = "50% 100%"
}: { className?: string; } & ImageStateEntry
): JSX.Element => {
  const path = useLoader(loader);
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
ProgressiveImage.displayName = "ProgressiveImage";

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
Background.displayName = "Background";
