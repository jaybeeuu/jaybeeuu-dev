import { useRef } from "preact/hooks";

export interface ScrollPosition {
  x: number;
  y: number;
  previous: {
    x: number;
    y: number;
  }
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

export const useScrollWithStyle = (elementHeight: number | undefined, scroll: ScrollPosition): string => {
  if (!elementHeight) {
    return "";
  }

  const top = useScrollWithTop(elementHeight, scroll);

  return `top: ${top}px;`;
};
