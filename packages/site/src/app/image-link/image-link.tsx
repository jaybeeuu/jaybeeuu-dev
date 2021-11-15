import classNames from "classnames";
import { useValue } from "@jaybeeuu/preact-recoilless";
import type { VNode } from "preact";
import { h } from "preact";
import type { Theme } from "../services/theme";
import { theme } from "../state";

import css from "./image-link.module.css";

interface ImageLinkProps {
  className?: string;
  href: string;
  imageSrc: string | {
    [theme in Theme]: string;
  };
  title: string;
}

export const ImageLink = ({
  title,
  className,
  href,
  imageSrc,
}: ImageLinkProps): VNode => {
  const [currentTheme] = useValue(theme);
  const imageSrcToUse = typeof imageSrc === "string"
    ? imageSrc
    : imageSrc[currentTheme];

  return (
    <a
      className={classNames(css.componentRoot, className)}
      href={href}
      title={title}
    >
      <img
        alt={title}
        src={imageSrcToUse}
      />
    </a>
  );
};
ImageLink.displayName = "ImageLink";
