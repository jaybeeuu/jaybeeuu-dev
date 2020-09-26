import { h, FunctionComponent } from "preact";
import Router from "preact-router";
import { StoreProvider } from "../recoilless/store-provider";
import { SidebarWithManifest } from "./side-bar";
import { PostRoute } from "./post";

export const App: FunctionComponent = () => (
  <div>
    <StoreProvider>
      <SidebarWithManifest/>
      <Router>
        <PostRoute path={"post/:slug"} />
      </Router>
    </StoreProvider>
  </div>
);
