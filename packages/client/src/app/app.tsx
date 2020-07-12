import { titleBar } from "@bickley-wallace/e2e-hooks";
import { h, FunctionComponent } from "preact";
import ApiRoot from "./api-root";

const App: FunctionComponent = () => (
  <div>
    <div className={titleBar.greeting}>Hello, Client World!</div>
    <ApiRoot />
  </div>
);

export default App;