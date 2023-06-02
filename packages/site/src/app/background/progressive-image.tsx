import classNames from "classnames";
import type { JSX } from "preact";
import { h } from "preact";
import css from "./background.module.css";

interface ProgressiveImageProps {
  alt: string;
  className?: string;
  src: string;
  placeholder: string;
  position?: string;
}

export const ProgressiveImage = ({
  alt,
  className,
  src,
  placeholder,
  position = "50% 100%"
}: ProgressiveImageProps): JSX.Element => (
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
      src={src}
      style={{ objectPosition: position }}
    />
  </div>
);
ProgressiveImage.displayName = "ProgressiveImage";
