import { h, VNode } from "preact";
import classNames from "classnames";

import css from "./title-bar.module.css";

export interface NavBarProps {
  className: string;
}

export const TitleBar = ({ className }: NavBarProps): VNode<any> => {
  return (
    <div className={classNames(css.componentRoot, className)}>
      <div className={css.title}>
        Josh Bickley-Wallace
      </div>
    </div>
  );
};
TitleBar.displayName  = "TitleBar";

