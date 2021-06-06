import { useValue } from "@bickley-wallace/preact-recoilless";
import classNames from "classnames";
import type { VNode } from "preact";
import { h } from "preact";
import type { Ref} from "preact/hooks";
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
  const titleRef = useRef<HTMLDivElement>();

  useLayoutEffect(() => {
    setTitleBaeHeight(
      titleRef.current?.offsetHeight ?? 0
    );
  }, []);

  return titleRef;
};

export const TitleBar = ({ className }: NavBarProps): VNode<any> => {
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
TitleBar.displayName  = "TitleBar";
