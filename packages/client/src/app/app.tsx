import type { FunctionComponent } from "preact";
import { h } from "preact";
import { main as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import Router from "preact-router";
import { Background } from "./background";
import { PostRoute } from "./post";
import { PostsRoute } from "./posts";
import { TitleBar } from "./title-bar";
import { Theme } from "./theme";
import { HomeRoute } from "./home";

import css from "./app.module.css";

export const App: FunctionComponent = () => (
  <Theme className={css.componentRoot}>
    <Background className={classNames(css.main, e2eHooks.root)}>
      <TitleBar className={css.static} />
      <Router>
        <HomeRoute path={"/"}/>
        <PostsRoute path={"posts"}/>
        <PostRoute path={"posts/:slug"}/>
      </Router>
    </Background>
  </Theme>
);
