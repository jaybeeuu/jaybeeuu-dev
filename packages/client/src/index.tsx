import { h, render } from "preact";
import { App } from "./app/app";
import { ErrorBoundary } from "./app/error-boundary";
import { StoreProvider } from "./recoilless/store-provider";

const appSelector = "#app";
const app = document.querySelector(appSelector);

if (!app) {
  throw new Error(`Unable to start app; missing element "${appSelector}"."`);
}

render(
  // <ErrorBoundary>
  <StoreProvider>
    <App />
  </StoreProvider>,
  // </ErrorBoundary>
  app
);
