
import { h, JSX } from "preact";
import { theme as e2eHooks } from "@bickley-wallace/e2e-hooks";
import classNames from "classnames";
import { useValue } from "../../recoilless/use-value";
import { Icon } from "../icon";
import { theme, Theme } from "../state";

import css from "./theme-toggle.module.css";

const toggleTheme = (currentTheme: Theme, setTheme: (newTheme: Theme) => void) => () => {
  setTheme(currentTheme === "light" ? "dark" : "light");
};

export const ThemeToggle = (): JSX.Element => {
  const [currentTheme, setTheme] = useValue(theme);
  return (
    <div className={e2eHooks.switch} onClick={toggleTheme(currentTheme, setTheme)}>
      <Icon name={"sun"} />
      <span className={css.track}>
        <span className={classNames(css.switch, { [css.right]: currentTheme === "dark" })}/>
      </span>
      <Icon name={"moon"} />
    </div>
  );
};
