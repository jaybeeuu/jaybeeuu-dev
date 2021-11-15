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
  className?: string;
  name: IconName;
  onClick?: JSX.MouseEventHandler<SVGElement>;
  title: string;
}

export const Icon = ({
  className,
  name,
  onClick,
  title
}: IconProps): JSX.Element => (
  <svg
    className={classNames(css.componentRoot, className)}
    onClick={onClick}
    role={"img"}
  >
    <title>{title}</title>
    <use xlinkHref={`${iconSprite}#${name}`} />
  </svg>
);
Icon.displayName = "Icon";
