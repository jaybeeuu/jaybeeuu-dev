import { useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import type { JSX, Ref } from "preact";
import { h } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { Link } from "preact-router";
import { NavBar } from "../nav-bar";
import { titleBarHeight, titleBarStyle } from "../state";

import css from "./title-bar.module.css";

export interface NavBarProps {
  className: string;
}

export const useTitleBarRef = (): Ref<HTMLDivElement> => {
  const [, setTitleBaeHeight] = useValue(titleBarHeight);
  const titleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setTitleBaeHeight(titleRef.current?.offsetHeight ?? 0);
  }, []);
  return titleRef;
};

export const TitleBar = ({ className }: NavBarProps): JSX.Element => {
  const titleRef = useTitleBarRef();
  const style = useValue(titleBarStyle);

  return (
    <div
      className={classNames(css.componentRoot, className)}
      style={style}
      ref={titleRef}
    >
      <h1 className={css.title}>
        <Link href="/">Josh Bickley-Wallace</Link>
      </h1>
      <NavBar />
    </div>
  );
};
TitleBar.displayName = "TitleBar";
