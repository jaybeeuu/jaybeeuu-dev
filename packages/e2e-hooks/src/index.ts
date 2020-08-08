import { makeClassSelectors, makeHooks } from "./make-hooks";

export { makeClassSelectors };

export const sideBar = makeHooks({
  block: "side-bar",
  greeting: "greeting",
  apiResults: "api-results"
});
