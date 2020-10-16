import { h, JSX } from "preact";
import classNames from "classnames";
import iconSprite from "./icons.svg";
import css from "./icon.module.css";

export type IconName
  = "moon"
  | "sun"
  | "link";

export interface IconProps {
  name: IconName;
  className?: string
}

export const Icon = ({ name, className }: IconProps): JSX.Element => (
  <svg className={classNames(css.element, className)}>
    <use xlinkHref={`${iconSprite}#${name}`} />
  </svg>
);
Icon.displayName = "Icon";
