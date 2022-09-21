import { main as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import type { VNode } from "preact";
import { h } from "preact";
import { Router } from "preact-router";
import { FouOhFour } from "./404";
import css from "./app.module.css";
import { Background } from "./background";
import { HomeRoute } from "./home";
import { PostRoute } from "./post";
import { PostsRoute } from "./posts";
import { TitleBar } from "./title-bar";
import { Theme } from "./theme";

const Route = ({ path }: { path: string }): VNode => <div>{path}</div>;

export const App = (): VNode => (
  <Theme className={css.componentRoot}>
    <Background className={classNames(css.main, e2eHooks.root)}>
      <TitleBar className={css.static} />
      <Router >
        <HomeRoute path="/" />
        <PostsRoute path="/blog" />
        <PostRoute path="/blog/:slug" />
        <FouOhFour default />
      </Router>
    </Background>
  </Theme>
);
