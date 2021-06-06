import type { VNode } from "preact";
import { h } from "preact";
import { useState } from "preact/hooks";
import { navBar as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import { Link } from "preact-router/match";
import { Icon } from "../icon";
import { ThemeToggle } from "../theme-toggle";

import css from "./nav-bar.module.css";

export interface NavBarProps {
  className?: string;
}

export const NavBar = ({ className }: NavBarProps): VNode<any> => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={classNames(css.componentRoot, e2eHooks.block, className)}
    >
      <Icon
        className={css.menuButton}
        name={"menu"}
        onClick={() => setIsOpen(!isOpen)}
      />
      <div className={classNames(css.optionsList, { [css.open]: isOpen })}>
        <Link
          activeClassName={css.active}
          className={classNames(css.link, e2eHooks.homeLink)}
          onClick={() => setIsOpen(false)}
          href={"/"}
        >
            Home
        </Link>
        <Link
          activeClassName={css.active}
          className={classNames(css.link, e2eHooks.postListLink)}
          onClick={() => setIsOpen(false)}
          href={"/posts"}
        >
            Blog
        </Link>
        <ThemeToggle className={e2eHooks.switch} />
      </div>
      <div
        onClick={() => setIsOpen(false)}
        className={classNames(css.dismissBox, { [css.open]: isOpen })}
      />
    </div>
  );
};
NavBar.displayName  = "NavBar";

