import { useValue } from "@bickley-wallace/preact-recoilless";
import classNames from "classnames";
import { h, VNode } from "preact";
import { useRef } from "preact/hooks";
import { Link } from "preact-router";
import { NavBar } from "../nav-bar";

import css from "./title-bar.module.css";
import { mainContentScroll, ScrollPosition } from "../state";

export interface NavBarProps {
  className: string;
}
const useScrollWithTop = (elementHeight: number, scroll: ScrollPosition): number => {
  const offset = useRef(0);

  const scrolledBy = scroll.y - scroll.previous.y;
  const goingDown = scrolledBy > 0;
  const newOffset = goingDown
    ? Math.min(elementHeight + 500, offset.current + scrolledBy)
    : Math.max(0, offset.current + scrolledBy);

  offset.current = newOffset;

  return scroll.y - newOffset;
};

const useScrollWithStyle = (elementHeight: number | undefined, scroll: ScrollPosition): string => {
  if (!elementHeight) {
    return "";
  }

  const top = useScrollWithTop(elementHeight, scroll);

  return `top: ${top}px;`;
};

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

