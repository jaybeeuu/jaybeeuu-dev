import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { theme as e2eHooks } from "@jaybeeuu/e2e-hooks";
import { useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import { theme } from "../state";

import "./base-styles.css";
import "./colours.css";

import "./code-highlight-colours.css";
import "./code-highlight.css";
import "./code.css";
export interface ThemeProps {
  children: ComponentChildren;
  className: string;
}

export const Theme = ({ children, className }: ThemeProps): JSX.Element => {
  const [currentTheme] = useValue(theme);

  return (
    <div
      id="theme-root"
      className={classNames(
        currentTheme,
        className,
        e2eHooks.root,
      )}
    >
      {children}
    </div>
  );
};
Theme.displayName = "Theme";
