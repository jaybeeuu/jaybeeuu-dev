import { h, render } from "preact";
import App from "./app/app";

const appSelector = "#app";
const app = document.querySelector(appSelector);

const placeholderSelector = `${appSelector} .placeholder`;
const placeholder = document.querySelector(placeholderSelector);

if (!app || !placeholder) {
  throw new Error(`Unable to start app; missing element "${appSelector}" or "${placeholderSelector}"`);
}

render(<App />, app, placeholder);