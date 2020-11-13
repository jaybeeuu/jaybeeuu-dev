import { h, VNode } from "preact";
import { navBar as e2eHooks } from "@bickley-wallace/e2e-hooks";
import classNames from "classnames";
import { Link } from "preact-router/match";
import { ThemeToggle } from "../theme-toggle";

import css from "./nav-bar.module.css";

export interface NavBarProps {
  className: string;
}

export const NavBar = ({ className }: NavBarProps): VNode<any> => {
  return (
    <div className={classNames(css.componentRoot, e2eHooks.block, className)}>
      <Link
        activeClassName={css.active}
        className={classNames(css.link, e2eHooks.postListLink)}
        href={"/posts"}
      >Posts</Link>
      <ThemeToggle className={e2eHooks.switch} />
    </div>
  );
};
NavBar.displayName  = "NavBar";

