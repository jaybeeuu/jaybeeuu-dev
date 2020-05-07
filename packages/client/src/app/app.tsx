import { titleBar } from "@bickley-wallace/e2e-hooks/title-bar";
import { h, FunctionComponent } from "preact";
import ApiRoot from "./api-root/api-root";

const e2eHooks = titleBar();

const App: FunctionComponent = () => (
  <div className={e2eHooks.element}>
    <div>Hello, Client World!</div>
    <ApiRoot />
  </div>
);

export default App;