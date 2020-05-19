import { makeHooks } from "./make-hooks";

const titleBar = makeHooks({
  block: "title-bar",
  greeting: "greeting"
});

export { titleBar };