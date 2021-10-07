
import type { JSX } from "preact";
import { h } from "preact";
import { useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { Theme } from "../services/theme";
import { Icon } from "../icon";
import { theme } from "../state";

import css from "./theme-toggle.module.css";

const toggleTheme = (currentTheme: Theme, setTheme: (newTheme: Theme) => void) => () => {
  setTheme(currentTheme === "light" ? "dark" : "light");
};

export interface ThemeToggleProps {
  className: string;
}

export const ThemeToggle = ({ className }: ThemeToggleProps): JSX.Element => {
  const [currentTheme, setTheme] = useValue(theme);
  return (
    <div className={classNames(css.componentRoot, className)} onClick={toggleTheme(currentTheme, setTheme)}>
      <Icon className={css.icon} name={"sun"} />
      <span className={css.track}>
        <span className={classNames(css.switch, { [css.right]: currentTheme === "dark" })}/>
      </span>
      <Icon className={css.icon} name={"moon"} />
    </div>
  );
};
