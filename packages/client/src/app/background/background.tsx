import { h, ComponentChildren, JSX } from "preact";
import { useValue } from "@bickley-wallace/preact-recoiless";
import classNames from "classnames";
import { backgroundImage, theme } from "../state";

import css from "./background.module.css";
import backgroundImages from "./background-images.module.css";

export interface BackgroundProps {
  children: ComponentChildren;
  className: string;
}

export const Background = ({ children, className }: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [background] = useValue(backgroundImage);

  return (
    <div className={classNames(className, css.componentRoot)}>
      <div className={classNames(
        css.backgroundImage,
        backgroundImages[background.light],
        { [css.show]: currentTheme === "light" }
      )}/>
      <div className={classNames(
        css.backgroundImage,
        backgroundImages[background.dark],
        { [css.show]: currentTheme === "dark" }
      )}/>
      <div className={css.content}>
        {children}
      </div>
    </div>
  );
};
Background.displayName = "Theme";
