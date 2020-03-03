import React, { ReactElement } from "react";
import ApiRoot from "./api-root/api-root";

const App = (): ReactElement => (
  <>
    <div>Hello, Client World!</div>
    <ApiRoot />
  </>
);

export default App;