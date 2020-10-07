import { h, FunctionComponent } from "preact";
import Router from "preact-router";
import { PostRoute } from "./post";
import { Sidebar } from "./navbar";
import { Theme } from "./theme";

import "../style/theme-colours.css";

export const App: FunctionComponent = () => (
  <Theme>
    <Sidebar/>
    <Router>
      <PostRoute path={"post/:slug"}/>
    </Router>
  </Theme>
);
