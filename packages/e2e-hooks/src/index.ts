import { makeClassSelectors, makeHookBlock } from "./make-hooks";

export { makeClassSelectors };

const mainPanelHookBlock = makeHookBlock("post");
export const post = {
  block: mainPanelHookBlock(),
  article: mainPanelHookBlock.element("article")
};

const navBarHookBlock = makeHookBlock("nav-bar");
const postBlock = navBarHookBlock.childBlock("post");
export const navBar = {
  block: navBarHookBlock(),
  post: {
    block: postBlock(),
    id: (slug: string): string => postBlock.modifier(slug),
    link: postBlock.element("link"),
    abstract: postBlock.element("abstract")
  }
};

const themeHookBlock = makeHookBlock("theme");
export const theme = {
  root: themeHookBlock.element("root"),
  switch: themeHookBlock.element("switch")
};
