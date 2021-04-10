import { useValue } from "@bickley-wallace/preact-recoilless";
import classNames from "classnames";
import { h, VNode } from "preact";
import { useRef } from "preact/hooks";
import { Link } from "preact-router";
import { NavBar } from "../nav-bar";

import css from "./title-bar.module.css";
import { mainContentScroll } from "../state";
import { useScrollWithStyle } from "../../use-scroll-with-style";

export interface NavBarProps {
  className: string;
}

export const TitleBar = ({ className }: NavBarProps): VNode<any> => {
  const titleRef = useRef<HTMLDivElement>();
  const [scroll] = useValue(mainContentScroll);
  const style = useScrollWithStyle(titleRef.current?.offsetHeight, scroll);

  return (
    <div className={classNames(css.componentRoot, className)}>
      <div className={css.titleWrapper} ref={titleRef} style={style}>
        <h1 className={css.title}>
          <Link href="/">Josh Bickley-Wallace</Link>
        </h1>
        <NavBar />
      </div>
    </div>
  );
};
TitleBar.displayName  = "TitleBar";
