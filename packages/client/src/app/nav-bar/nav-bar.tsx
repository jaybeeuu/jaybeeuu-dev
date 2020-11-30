import { h, VNode } from "preact";
import { useState } from "preact/hooks";
import { navBar as e2eHooks } from "@bickley-wallace/e2e-hooks";
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
    <div className={classNames(css.componentRoot, e2eHooks.block, className)}>
      <Icon name={"menu"} className={css.menuButton} onClick={() => setIsOpen(!isOpen)}/>
      <div className={css.optionsList}>
        <Link
          activeClassName={css.active}
          className={classNames(css.link, e2eHooks.homeLink)}
          href={"/"}
        >
          Home
        </Link>
        <Link
          activeClassName={css.active}
          className={classNames(css.link, e2eHooks.postListLink)}
          href={"/posts"}
        >
          Blog
        </Link>
        <ThemeToggle className={e2eHooks.switch} />
      </div>
    </div>
  );
};
NavBar.displayName  = "NavBar";

