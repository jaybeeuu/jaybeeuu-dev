import { h, FunctionComponent } from "preact";
import Router from "preact-router";
import { StoreProvider } from "../recoilless/store-provider";
import { PostRoute } from "./post";
import { Sidebar } from "./side-bar";
import { Theme } from "./theme";

import "../style/theme-colours.css";

export const App: FunctionComponent = () => (
  <Theme>
    <StoreProvider>
      <Sidebar/>
      <Router>
        <PostRoute path={"post/:slug"} />
      </Router>
    </StoreProvider>
  </Theme>
);
