import { useIsMounted } from "@jaybeeuu/preact-async";
import classNames from "classnames";
import type { JSX } from "preact";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import css from "./background.module.css";
import type { ImageLoader } from "../images/image-loader";

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

interface ProgressiveImageProps {
  alt: string;
  className?: string;
  loader: ImageLoader;
  src: string;
  placeholder: string;
  position?: string;
}

export const ProgressiveImage = ({
  alt,
  className,
  loader,
  placeholder,
  position = "50% 100%"
}: ProgressiveImageProps): JSX.Element => {
  const path = useLoader(loader);

  return (
    <div
      className={classNames(css.backgroundPicture, className)}
      style={{
        backgroundImage: `url(${placeholder})`,
        backgroundPosition: position
      }}
    >
      <img
        alt={alt}
        className={css.backgroundImage}
        src={path}
        style={{ objectPosition: position }}
      />
    </div>
  );
};
ProgressiveImage.displayName = "ProgressiveImage";
