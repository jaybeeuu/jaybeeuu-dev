import { getMakeHooks } from "./make-hooks";

const titleBar = getMakeHooks({
  block: "title-bar",
  greeting: "greeting"
});

export { titleBar };