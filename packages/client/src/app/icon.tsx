import { h, JSX } from "preact";
import iconSprite from "./icons.svg";
import css from "./icon.module.css";

export type IconName
  = "moon"
  | "sun";

export interface IconProps {
  name: IconName;
}

export const Icon = ({ name}: IconProps): JSX.Element => (
  <svg className={css.element}>
    <use xlinkHref={`${iconSprite}#${name}`} />
  </svg>
);
Icon.displayName = "Icon";
