import { h, FunctionComponent } from "preact";
import ApiRoot from "./api-root/api-root";

const App: FunctionComponent = () => (
  <div>
    <div>Hello, Client World!</div>
    <ApiRoot />
  </div>
);

export default App;