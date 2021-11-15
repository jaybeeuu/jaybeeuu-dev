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

export const NavBar = ({ className }: NavBarProps): VNode => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={classNames(css.componentRoot, e2eHooks.block, className)}
    >
      <Icon
        className={css.menuButton}
        name={"menu"}
        onClick={() => setIsOpen(!isOpen)}
        title={"Menu"}
      />
      <div className={classNames(css.optionsList, { [css.open]: isOpen })}>
        <Link
          activeClassName={css.active}
          className={classNames(css.link, e2eHooks.homeLink)}
          href={"/"}
          onClick={() => setIsOpen(false)}
        >
            Home
        </Link>
        <Link
          activeClassName={css.active}
          className={classNames(css.link, e2eHooks.postsListLink)}
          href={"/blog"}
          onClick={() => setIsOpen(false)}
        >
            Blog
        </Link>
        <ImageLink
          className={e2eHooks.linkedInLink}
          href={"https://linkedin.com/in/jaybeeuu"}
          imageSrc={linkedInLogo}
          title={"Linked In"}
        />
        <ImageLink
          className={e2eHooks.gitHubLink}
          href={"https://github.com/jaybeeuu"}
          imageSrc={{
            light: githubDark,
            dark: githubLight
          }}
          title={"GitHub"}
        />
        <IconLink
          href={"feeds/atom.xml"}
          iconName={"rss_feed"}
          title="Atom Feed"
          type={"application/atom+xml"}
        />
        <ThemeToggle className={e2eHooks.switch} />
      </div>
      <div
        className={classNames(css.dismissBox, { [css.open]: isOpen })}
        onClick={() => setIsOpen(false)}
      />
    </div>
  );
};
NavBar.displayName  = "NavBar";

