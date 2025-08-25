import classNames from "classnames";
import type { JSX } from "preact";
import { h } from "preact";
import type { IconName } from "../icon/index";
import { Icon } from "../icon/index";
import css from "./local-icon-link.module.css";

export type { IconName };

export interface IconLinkProps {
  title: string;
  href: string;
  iconName: IconName;
  type: string;
  className?: string;
}

export const LocalIconLink = ({
  className,
  title,
  href,
  iconName,
  type,
}: IconLinkProps): JSX.Element => (
  <a
    className={classNames(css.componentRoot, className)}
    href={href}
    type={type}
    title={title}
    data-native
  >
    <Icon title={title} name={iconName} />
  </a>
);
LocalIconLink.displayName = "IconLink";
