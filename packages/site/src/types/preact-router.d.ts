declare module "preact-router/match" {
  import type * as preact from "preact";

  // Merge with existing LinkProps to add missing props
  export interface LinkProps
    extends preact.JSX.HTMLAttributes<HTMLAnchorElement> {
    href?: string;
    activeClassName?: string;
  }

  export function Link(props: LinkProps): preact.VNode;
}
