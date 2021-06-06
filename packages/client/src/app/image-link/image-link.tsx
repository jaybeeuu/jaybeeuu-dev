import { useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { VNode } from "preact";
import { h } from "preact";
import type { Theme } from "../state";
import { theme } from "../state";

import css from "./image-link.module.css";

interface ImageLinkProps {
  className?: string;
  href: string;
  imageSrc: string | {
    [theme in Theme]: string;
  };
  alt: string;
}

export const ImageLink = ({
  alt,
  className,
  href,
  imageSrc,
}: ImageLinkProps): VNode<any> => {
  const [currentTheme] = useValue(theme);
  const imageSrcToUse = typeof imageSrc === "string"
    ? imageSrc
    : imageSrc[currentTheme];

  return (
    <a
      className={classNames(css.componentRoot, className)}
      href={href}
    >
      <img src={imageSrcToUse} alt={alt} />
    </a>
  );
};
ImageLink.displayName = "ImageLink";
