import type { JSX } from "preact";
import { h } from "preact";
import classNames from "classnames";
import iconSprite from "./icons.sprite.svg";

import css from "./icon.module.css";

export type IconName
  = "link"
  | "menu"
  | "moon"
  | "rss_feed"
  | "sun";

export interface IconProps {
  alt: string;
  className?: string;
  name: IconName;
  onClick?: JSX.MouseEventHandler<SVGElement>;
}

export const Icon = ({
  alt,
  className,
  name,
  onClick
}: IconProps): JSX.Element => (
  <svg
    alt={alt}
    className={classNames(css.componentRoot, className)}
    onClick={onClick}
  >
    <use xlinkHref={`${iconSprite}#${name}`} />
  </svg>
);
Icon.displayName = "Icon";
