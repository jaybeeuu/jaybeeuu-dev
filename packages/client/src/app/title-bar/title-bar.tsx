import { h, VNode } from "preact";
import classNames from "classnames";

import css from "./title-bar.module.css";

export interface NavBarProps {
  className: string;
}

export const TitleBar = ({ className }: NavBarProps): VNode<any> => {
  return (
    <div className={classNames(css.componentRoot, className)}>
      <h1 className={css.title}>
        Josh Bickley-Wallace
      </h1>
    </div>
  );
};
TitleBar.displayName  = "TitleBar";

