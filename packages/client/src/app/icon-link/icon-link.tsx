import type { JSX } from "preact";
import { h } from "preact";
import type { IconName } from "../icon/index";
import { Icon } from "../icon/index";

import css from "./icon-link.module.css";

export type { IconName };

export interface IconLinkProps {
  name: IconName;
  href: string;
}

export const IconLink = ({
  href,
  name
}: IconLinkProps): JSX.Element => (
  <a
    className={css.componentRoot}
    href={href}
  >
    <Icon name={name} />
  </a>
);

IconLink.displayName = "IconLink";
