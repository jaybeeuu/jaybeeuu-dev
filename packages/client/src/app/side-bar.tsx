import { h, FunctionComponent } from "preact";
import { sideBar } from "@bickley-wallace/e2e-hooks";
import ApiRoot from "./api-root";

const SideBar: FunctionComponent = () => (
  <div className={sideBar.block}>
    <div className={sideBar.greeting}>Hello, Side Bar!</div>
    <ApiRoot />
  </div>
);

SideBar.displayName = "SideBar";

export default SideBar;