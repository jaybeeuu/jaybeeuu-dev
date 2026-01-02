import classNames from "classnames";
import { useValue } from "@jaybeeuu/preact-recoilless";
import type { JSX } from "preact";
import { h } from "preact";
import type { Theme } from "../services/theme.js";
import { theme } from "../state.js";

import css from "./image-link.module.css";

interface ImageLinkProps {
  className?: string;
  href: string;
  imageSrc:
    | string
    | {
        [theme in Theme]: string;
      };
  title: string;
  target?: string;
}

export const ImageLink = ({
  title,
  className,
  href,
  imageSrc,
  target,
}: ImageLinkProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const imageSrcToUse =
    typeof imageSrc === "string" ? imageSrc : imageSrc[currentTheme];

  return (
    <a
      className={classNames(css.componentRoot, className)}
      href={href}
      title={title}
      target={target}
    >
      <img alt={title} src={imageSrcToUse} />
    </a>
  );
};
ImageLink.displayName = "ImageLink";
