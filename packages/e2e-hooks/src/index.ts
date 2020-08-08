import { makeClassSelectors, makeHooks } from "./make-hooks";

export { makeClassSelectors };

export const titleBar = makeHooks({
  block: "title-bar",
  greeting: "greeting",
  apiResults: "api-results"
});


export const sideBar = makeHooks({
  block: "side-bar"
});
