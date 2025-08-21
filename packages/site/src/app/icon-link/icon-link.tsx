import type { JSX } from "preact";
import { h } from "preact";
import type { IconName } from "../icon/index";
import { Icon } from "../icon/index";

import css from "./icon-link.module.css";

export type { IconName };

export interface IconLinkProps {
  title: string;
  href: string;
  iconName: IconName;
  type: string;
  native: boolean;
}

export const IconLink = ({
  title,
  href,
  iconName,
  type,
  native = false,
}: IconLinkProps): JSX.Element => (
  <a
    className={css.componentRoot}
    href={href}
    type={type}
    title={title}
    data-native={native}
  >
    <Icon title={title} name={iconName} />
  </a>
);
IconLink.displayName = "IconLink";
