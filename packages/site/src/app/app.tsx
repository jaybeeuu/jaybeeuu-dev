import { main as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import type { JSX } from "preact";
import { h } from "preact";
import { Switch, Route } from "wouter";
import { FouOhFour } from "./four-oh-four.js";
import css from "./app.module.css";
import { Background } from "./background/index.js";
import { Home } from "./home/index.js";
import { PostLookup } from "./post/index.js";
import { Posts } from "./posts/index.js";
import { TitleBar } from "./title-bar/index.js";
import { ThemeRoot } from "./theme/index.js";

export const App = (): JSX.Element => (
  <ThemeRoot className={css.componentRoot}>
    <Background className={classNames(css.main, e2eHooks.root)}>
      <TitleBar className={css.static} />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={Posts} />
        <Route path="/blog/:slug" component={PostLookup} />
        <Route component={FouOhFour} />
      </Switch>
    </Background>
  </ThemeRoot>
);
App.displayName = "App";
