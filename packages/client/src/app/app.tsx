import { h, FunctionComponent } from "preact";
import Router from "preact-router";
import { PostRoute } from "./post";
import { NavBar } from "./nav-bar";
import { Theme } from "./theme";

export const App: FunctionComponent = () => (
  <Theme>
    <Router>
      <PostRoute path={"post/:slug"}/>
    </Router>
    <NavBar/>
  </Theme>
);
