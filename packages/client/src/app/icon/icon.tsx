import { h, JSX } from "preact";
import classNames from "classnames";
import iconSprite from "./icons.sprite.svg";

import css from "./icon.module.css";

export type IconName
  = "link"
  | "menu"
  | "moon"
  | "sun";

export interface IconProps extends JSX.HTMLAttributes<SVGSVGElement> {
  name: IconName;
}

export const Icon = ({ name, ...props }: IconProps): JSX.Element => (
  <svg {...props} className={classNames(css.componentRoot, props.className)}>
    <use xlinkHref={`${iconSprite}#${name}`} />
  </svg>
);
Icon.displayName = "Icon";
