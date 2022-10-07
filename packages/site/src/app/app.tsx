import { main as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import type { JSX } from "preact";
import { h } from "preact";
import { Router } from "preact-router";
import { FouOhFour } from "./404";
import css from "./app.module.css";
import { Background } from "./background";
import { HomeRoute } from "./home";
import { PostRoute } from "./post";
import { PostsRoute } from "./posts";
import { TitleBar } from "./title-bar";
import { ThemeRoot } from "./theme";

export const App = (): JSX.Element => (
  <ThemeRoot className={css.componentRoot}>
    <Background className={classNames(css.main, e2eHooks.root)}>
      <TitleBar className={css.static} />
      <Router >
        <HomeRoute path="/" />
        <PostsRoute path="/blog" />
        <PostRoute path="/blog/:slug" />
        <FouOhFour default />
      </Router>
    </Background>
  </ThemeRoot>
);
