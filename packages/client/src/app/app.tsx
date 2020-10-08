import { h, FunctionComponent } from "preact";
import Router from "preact-router";
import { PostRoute } from "./post";
import { PostsRoute } from "./posts";
import { NavBar } from "./nav-bar";
import { Theme } from "./theme";

export const App: FunctionComponent = () => (
  <Theme>
    <Router>
      <PostsRoute path={"posts"}/>
      <PostRoute path={"posts/:slug"}/>
    </Router>
    <NavBar/>
  </Theme>
);
