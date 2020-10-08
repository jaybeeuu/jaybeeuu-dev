
import { h, JSX } from "preact";
import classNames from "classnames";
import { useValue } from "../../recoilless/use-value";
import { Icon } from "../icon";
import { theme, Theme } from "../state";

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
    <div className={className} onClick={toggleTheme(currentTheme, setTheme)}>
      <Icon name={"sun"} />
      <span className={css.track}>
        <span className={classNames(css.switch, { [css.right]: currentTheme === "dark" })}/>
      </span>
      <Icon name={"moon"} />
    </div>
  );
};
