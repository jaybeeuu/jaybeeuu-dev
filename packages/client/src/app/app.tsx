import type { FunctionComponent, VNode } from "preact";
import { h } from "preact";
import { main as e2eHooks } from "@jaybeeuu/e2e-hooks";
import classNames from "classnames";
import Router from "preact-router";
import css from "./app.module.css";
import { asRoute } from "./as-route";
import { Background } from "./background";
import { ErrorMessage } from "./error";
import { HomeRoute } from "./home";
import { PostRoute } from "./post";
import { PostsRoute } from "./posts";
import { TitleBar } from "./title-bar";
import { Theme } from "./theme";
import { useBackgrounds } from "./use-background";

const FouOhFour = asRoute((): VNode<any> => {
  useBackgrounds({ dark: "galaxy", light: "harmonyRidge" });
  return (
    <ErrorMessage
      heading="Whoops! That's a 404."
      message="Sorry, there isn't anything here."
    />
  );
});

export const App: FunctionComponent = () => (
  <Theme className={css.componentRoot}>
    <Background className={classNames(css.main, e2eHooks.root)}>
      <TitleBar className={css.static} />
      <Router>
        <HomeRoute path={"/"}/>
        <PostsRoute path={"blog"}/>
        <PostRoute path={"blog/:slug"}/>
        <FouOhFour default />
      </Router>
    </Background>
  </Theme>
);
