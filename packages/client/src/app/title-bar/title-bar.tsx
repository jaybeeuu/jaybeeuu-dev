import { h, VNode } from "preact";
import classNames from "classnames";

import css from "./title-bar.module.css";
import { NavBar } from "../nav-bar";
import { Link } from "preact-router";

export interface NavBarProps {
  className: string;
}

export const TitleBar = ({ className }: NavBarProps): VNode<any> => {
  return (
    <div className={classNames(css.componentRoot, className)}>
      <h1 className={css.title}>
        <Link href="/">Josh Bickley-Wallace</Link>
      </h1>
      <NavBar />
    </div>
  );
};
TitleBar.displayName  = "TitleBar";

