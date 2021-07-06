import type { ComponentChildren, JSX} from "preact";
import { h, Fragment } from "preact";
import { CSSTransition } from "preact-transitioning";
import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import { backgroundImages, onMainContentScroll, theme } from "../state";
import css from "./background.module.css";
import backgrounds from "./background-images.module.css";

export interface BackgroundProps {
  children: ComponentChildren;
  className?: string;
}

export const Background = ({ children, className }: BackgroundProps): JSX.Element => {
  const [currentTheme] = useValue(theme);
  const [images] = useValue(backgroundImages);
  const onScroll = useAction(onMainContentScroll);
  return (
    <div className={classNames(className, css.componentRoot)}>
      {images ? (
        <Fragment>
          <CSSTransition
            classNames={css}
            in={currentTheme === "light"}
            duration={500}
            appear
          >
            <div className={classNames(
              css.backgroundImage,
              backgrounds[images.light]
            )}/>
          </CSSTransition>
          <CSSTransition
            classNames={css}
            in={currentTheme === "dark"}
            duration={500}
            appear
          >
            <div className={classNames(
              css.backgroundImage,
              backgrounds[images.dark]
            )}/>
          </CSSTransition>
        </Fragment>
      ) : null}
      <div
        className={css.content}
        onScroll={(event) => {
          onScroll({
            x: event.currentTarget?.scrollLeft,
            y: event.currentTarget?.scrollTop,
          });
        }}
      >
        {children}
      </div>
    </div>
  );
};
Background.displayName = "Theme";
