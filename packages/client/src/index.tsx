import { h, render } from "preact";
import { App } from "./app/app";
import { StoreProvider } from "@bickley-wallace/preact-recoiless";

const appSelector = "#app";
const app = document.querySelector(appSelector);

if (!app) {
  throw new Error(`Unable to start app; missing element "${appSelector}"."`);
}

render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  app
);
