import type { VNode } from "preact";
import { h } from "preact";
import { useState } from "preact/hooks";
import { navBar as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import { Link } from "preact-router/match";
import { Icon } from "../icon/index";
import { ThemeToggle } from "../theme-toggle/index";
import { ImageLink } from "../image-link/index";
import { IconLink } from "../icon-link/index";
import linkedInLogo from "./in-blue-logo.png";

import githubLight from "./github-light.png";
import githubDark from "./github-dark.png";

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
          className={classNames(css.link, e2eHooks.postsListLink)}
          onClick={() => setIsOpen(false)}
          href={"/blog"}
        >
            Blog
        </Link>
        <ImageLink
          alt={"Linked In"}
          href={"https://linkedin.com/in/jaybeeuu"}
          imageSrc={linkedInLogo}
          className={e2eHooks.linkedInLink}
        />
        <ImageLink
          alt={"GitHub"}
          href={"https://github.com/jaybeeuu"}
          imageSrc={{
            light: githubDark,
            dark: githubLight
          }}
          className={e2eHooks.gitHubLink}
        />
        <IconLink
          alt="Atom Feed"
          href={"feeds/atom.xml"}
          iconName={"rss_feed"}
          type={"application/atom+xml"}
        />
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

