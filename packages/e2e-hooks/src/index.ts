import { makeClassSelectors, makeHookBlock } from "./make-hooks";

export { makeClassSelectors };

const sideBarHookBlock = makeHookBlock("side-bar");
const postBlock = sideBarHookBlock.childBlock("post");

export const sideBar = {
  block: sideBarHookBlock(),
  post: {
    block: postBlock(),
    id: (slug: string): string => postBlock.modifier(slug),
    link: postBlock.element("link"),
    abstract: postBlock.element("abstract")
  }
};
