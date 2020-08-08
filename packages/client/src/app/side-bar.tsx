import { sideBar } from "@bickley-wallace/e2e-hooks";
import { h, FunctionComponent } from "preact";

const SideBar: FunctionComponent = () => (
  <div className={sideBar.block}>Hello, Side Bar!</div>
);

SideBar.displayName = "SideBar";

export default SideBar;