import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { useEffect } from "preact/hooks";
import classNames from "classnames";
import { theme as e2eHooks } from "@jaybeeuu/e2e-hooks";
import { useValue } from "@jaybeeuu/preact-recoilless";
import type { Theme } from "../services/theme";
import { listenToMediaTheme, persistedTheme } from "../services/theme";
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

const useTheme = (): Theme => {
  const [currentTheme, setStateTheme] = useValue(theme);

  useEffect(() => {
    return listenToMediaTheme(setStateTheme);
  }, []);

  useEffect(() => {
    persistedTheme.set(currentTheme);
  }, [currentTheme]);

  return currentTheme;
};

export const ThemeRoot = ({ children, className }: ThemeProps): JSX.Element => {
  const currentTheme = useTheme();

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
ThemeRoot.displayName = "ThemeRoot";
