import { h, FunctionComponent } from "preact";
import { Manifest } from "./manifest";
import { SideBar } from "./side-bar";
import { PostRoute } from "./post";
import Router from "preact-router";

const App: FunctionComponent = () => (
  <Manifest>
    <SideBar/>
    <Router>
      <PostRoute path={"post/:slug"} />
    </Router>
  </Manifest>
);

export default App;
