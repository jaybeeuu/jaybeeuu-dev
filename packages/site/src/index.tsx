import { h, render } from "preact";
import { App } from "./app";
import { StoreProvider } from "@jaybeeuu/preact-recoilless";

if (process.env.NODE_ENV === "development") {
  import("preact/debug");
}

const appSelector = "#app";
const app = document.querySelector(appSelector);

if (!app) {
  throw new Error(`Unable to start app; missing element "${appSelector}"."`);
}

render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  app,
);
