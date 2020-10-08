import { makeClassSelectors, makeHookBlock } from "./make-hooks";

export { makeClassSelectors };

const postHookBlock = makeHookBlock("post");
export const post = {
  block: postHookBlock(),
  article: postHookBlock.element("article")
};

const navBarHookBlock = makeHookBlock("nav-bar");
export const navBar = {
  block: navBarHookBlock(),
  postListLink: navBarHookBlock.element("post-list-link"),
  switch: navBarHookBlock.element("switch")
};

const postListHookBlock = makeHookBlock("post-list");
export const postList = {
  block: postListHookBlock(),
  id: (slug: string): string => postListHookBlock.modifier(slug),
  link: postListHookBlock.element("link"),
  abstract: postListHookBlock.element("abstract")
};

const themeHookBlock = makeHookBlock("theme");
export const theme = {
  root: themeHookBlock.element("root"),
};
