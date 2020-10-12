import { h, VNode } from "preact";
import { navBar as e2eHooks } from "@bickley-wallace/e2e-hooks";
import classNames from "classnames";
import { Link } from "preact-router";
import { ThemeToggle } from "../theme-toggle";

import css from "./nav-bar.module.css";

export interface NavBarProps {
  className: string;
}

export const NavBar = ({ className }: NavBarProps): VNode<any> => {
  return (
    <div className={classNames(css.element, e2eHooks.block, className)}>
      <ThemeToggle className={e2eHooks.switch} />
      <Link href={"/posts"} className={e2eHooks.postListLink}>Posts</Link>
    </div>
  );
};
NavBar.displayName  = "NavBar";

