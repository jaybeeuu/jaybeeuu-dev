import { h, ComponentChildren, JSX, Fragment } from "preact";
import { useValue } from "@bickley-wallace/preact-recoiless";
import classNames from "classnames";
import { backgroundImages, theme } from "../state";

import css from "./background.module.css";
import backgrounds from "./background-images.module.css";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

export const Background = ({ children, className }: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [images] = useValue(backgroundImages);

  return (
    <div className={classNames(className, css.componentRoot)}>
      {images ? (
        <Fragment>
          <div className={classNames(
            css.backgroundImage,
            backgrounds[images.light],
            { [css.show]: currentTheme === "light" }
          )}/>
          <div className={classNames(
            css.backgroundImage,
            backgrounds[images.dark],
            { [css.show]: currentTheme === "dark" }
          )}/>
        </Fragment>
      ) : null}
      <div className={css.content}>
        {children}
      </div>
    </div>
  );
};
Background.displayName = "Theme";
