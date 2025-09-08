import { navBar as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import type { JSX } from "preact";
import { h } from "preact";
import { Link, useLocation } from "wouter";
import { useState } from "preact/hooks";
import { Icon } from "../icon/index";
import { ImageLink } from "../image-link/index";
import { LocalIconLink } from "../local-icon-link/index";
import { ThemeToggle } from "../theme-toggle/index";
import githubDark from "./github-dark.png";
import githubLight from "./github-light.png";
import linkedInLogo from "./in-blue-logo.png";
import css from "./nav-bar.module.css";

export interface NavBarProps {
  className?: string;
}

export const NavBar = ({ className }: NavBarProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className={classNames(css.componentRoot, e2eHooks.block, className)}>
      <Icon
        className={css.menuButton}
        name={"menu"}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        title={"Menu"}
      />
      <div className={classNames(css.optionsList, { [css.open]: isOpen })}>
        <Link
          className={classNames(css.link, e2eHooks.homeLink, {
            [css.active]: location === "/",
            [e2eHooks.activeLink]: location === "/",
          })}
          to={"/"}
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Home
        </Link>
        <Link
          className={classNames(css.link, e2eHooks.postsListLink, {
            [css.active]: location.startsWith("/blog"),
            [e2eHooks.activeLink]: location.startsWith("/blog"),
          })}
          to={"/blog"}
          onClick={() => {
            setIsOpen(false);
          }}
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
            dark: githubLight,
          }}
          title={"GitHub"}
        />
        <LocalIconLink
          className={e2eHooks.atomFeedLink}
          href={"/feeds/atom.xml"}
          iconName={"rss_feed"}
          title="Atom Feed"
          type={"application/atom+xml"}
        />
        <ThemeToggle className={e2eHooks.switch} />
      </div>
      <div
        className={classNames(css.dismissBox, { [css.open]: isOpen })}
        onClick={() => {
          setIsOpen(false);
        }}
      />
    </div>
  );
};
NavBar.displayName = "NavBar";
