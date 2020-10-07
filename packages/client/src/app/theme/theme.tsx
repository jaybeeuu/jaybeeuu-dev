import { h, ComponentChildren, JSX } from "preact";
import classNames from "classnames";
import { theme as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useValue } from "../../recoilless/use-value";
import { theme as themeSeed } from "../state";

import css from "./theme-colours.module.css";

export const Theme = ({ children }: { children: ComponentChildren }): JSX.Element => {
  const [theme] = useValue(themeSeed);
  return (
    <div id="theme-root" className={classNames(css[theme], theme, e2eHooks.root)}>
      {children}
    </div>
  );
};
Theme.displayName = "Theme";
