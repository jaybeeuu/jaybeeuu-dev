import { h, ComponentChildren, JSX, Fragment } from "preact";
import { useValue } from "@bickley-wallace/preact-recoilless";
import classNames from "classnames";
import { backgroundImages, mainContentScroll, theme } from "../state";

import css from "./background.module.css";
import backgrounds from "./background-images.module.css";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

export const Background = ({ children, className }: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [images] = useValue(backgroundImages);
  const [lastScroll, setScroll] = useValue(mainContentScroll);
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
      <div
        className={css.content}
        onScroll={(event) => {
          setScroll({
            x: event.currentTarget?.scrollLeft,
            y: event.currentTarget?.scrollTop,
            previous: { x: lastScroll.x, y: lastScroll.y }
          });
        }}
      >
        {children}
      </div>
    </div>
  );
};
Background.displayName = "Theme";
