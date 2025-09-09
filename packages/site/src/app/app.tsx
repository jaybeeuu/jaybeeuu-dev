import { main as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import type { JSX } from "preact";
import { h } from "preact";
import { Switch, Route } from "wouter";
import { FouOhFour } from "./four-oh-four";
import css from "./app.module.css";
import { Background } from "./background";
import { HomeRoute as Home } from "./home";
import { PostRoute } from "./post";
import { PostsRoute as Posts } from "./posts";
import { TitleBar } from "./title-bar";
import { ThemeRoot } from "./theme";

export const App = (): JSX.Element => (
  <ThemeRoot className={css.componentRoot}>
    <Background className={classNames(css.main, e2eHooks.root)}>
      <TitleBar className={css.static} />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={Posts} />
        <Route path="/blog/:slug" component={PostRoute} />
        <Route component={FouOhFour} />
      </Switch>
    </Background>
  </ThemeRoot>
);
App.displayName = "App";
