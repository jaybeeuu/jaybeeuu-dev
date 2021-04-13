import { useRef } from "preact/hooks";
import { ScrollPosition } from "../state";

const useScrollOffset = (
  elementHeight: number,
  scroll: ScrollPosition
): number => {
  const offset = useRef(0);

  const scrolledBy = scroll.y - scroll.previous.y;
  const goingDown = scrolledBy > 0;
  const newOffset = goingDown
    ? Math.min(elementHeight + 500, offset.current + scrolledBy)
    : Math.max(0, offset.current + scrolledBy);

  offset.current = newOffset;

  return newOffset;
};

export const useScrollWithStyle = (elementHeight: number | undefined, scroll: ScrollPosition): string => {
  if (!elementHeight) {
    return "";
  }

  const offset = useScrollOffset(elementHeight, scroll);

  return offset > 0
    ? `top: ${scroll.y - offset}px;`
    :   "position: -webkit-sticky;\n"
      + "position: sticky;\n"
      + "top: 0;";
};
