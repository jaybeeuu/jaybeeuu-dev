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
  gitHubLink: navBarHookBlock.element("github-link"),
  homeLink: navBarHookBlock.element("home-link"),
  linkedInLink: navBarHookBlock.element("linked-in-link"),
  postsListLink: navBarHookBlock.element("posts-list-link"),
  switch: navBarHookBlock.element("switch")
};

const postListHookBlock = makeHookBlock("post-list");
export const postList = {
  block: postListHookBlock(),
  link: postListHookBlock.makeModifierFactory()
};

const themeHookBlock = makeHookBlock("theme");
export const theme = {
  root: themeHookBlock.element("root"),
};

const mainBlock = makeHookBlock("main");
export const main = {
  root: mainBlock.element("root"),
};
