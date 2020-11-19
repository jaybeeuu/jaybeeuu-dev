import { h, ComponentChildren, JSX } from "preact";
import { theme as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useValue } from "@bickley-wallace/preact-recoiless";
import classNames from "classnames";
import { theme } from "../state";

import "./base-styles.css";
import "./colours.css";

export interface ThemeProps {
  children: ComponentChildren;
  className: string;
}

export const Theme = ({ children, className }: ThemeProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  return (
    <div id="theme-root" className={classNames(currentTheme, className, e2eHooks.root)}>
      {children}
    </div>
  );
};
Theme.displayName = "Theme";
