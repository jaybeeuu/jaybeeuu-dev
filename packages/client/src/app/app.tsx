import { h, FunctionComponent } from "preact";
import Router from "preact-router";
import { PostRoute } from "./post";
import { PostsRoute } from "./posts";
import { NavBar } from "./nav-bar";
import { Theme } from "./theme";

import css from "./app.module.css";

export const App: FunctionComponent = () => (
  <Theme className={css.componentRoot}>
    <div className={css.main}>
      <Router>
        <PostsRoute path={"posts"}/>
        <PostRoute path={"posts/:slug"}/>
      </Router>
    </div>
    <NavBar className={css.footer} />
  </Theme>
);
