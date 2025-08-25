import { makeClassSelectors, makeHookBlock } from "./make-hooks";

export { makeClassSelectors };

const postBlock = makeHookBlock("post");
export const post = {
  block: postBlock(),
  article: postBlock.element("article"),
  header: postBlock.element("header"),
};

const navBarBlock = makeHookBlock("nav-bar");
export const navBar = {
  block: navBarBlock(),
  gitHubLink: navBarBlock.element("github-link"),
  homeLink: navBarBlock.element("home-link"),
  linkedInLink: navBarBlock.element("linked-in-link"),
  postsListLink: navBarBlock.element("posts-list-link"),
  atomFeedLink: navBarBlock.element("atom-link"),
  switch: navBarBlock.element("switch"),
};

const postListBlock = makeHookBlock("post-list");
const postListLinkBlock = postListBlock.childBlock("post-link");
export const postList = {
  block: postListBlock(),
  link: postListLinkBlock(),
  sluggedLink: postListLinkBlock.makeModifierFactory(),
};

const themeBlock = makeHookBlock("theme");
export const theme = {
  root: themeBlock.element("root"),
};

const mainBlock = makeHookBlock("main");
export const main = {
  root: mainBlock.element("root"),
};

const fourOhFourBlock = makeHookBlock("four-oh-four");
export const fourOhFour = {
  root: fourOhFourBlock.element("root"),
};
