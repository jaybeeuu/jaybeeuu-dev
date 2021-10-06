import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { theme as e2eHooks } from "@jaybeeuu/e2e-hooks";
import { useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import { theme, themeMediaQuery } from "../state";

import "./base-styles.css";
import "./colours.css";

import "./code-highlight-colours.css";
import "./code-highlight.css";
import "./code.css";
import { useEffect } from "packages/preact-recoilless/node_modules/preact/hooks/src";
export interface ThemeProps {
  children: ComponentChildren;
  className: string;
}

const useUserPreferedTheme = (): void => {
  useEffect(() => {
    const handler = (event: MediaQueryListEvent): void => {
      event.matches;
    };

    themeMediaQuery.addEventListener("change", handler);
  });
};

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
