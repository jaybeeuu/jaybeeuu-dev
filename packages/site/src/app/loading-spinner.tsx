import type { JSX } from "preact";
import { h } from "preact";

export const LoadingSpinner = (): JSX.Element => (
  <div className={"fade-in"}>
    <div className="spinner" />
  </div>
);
LoadingSpinner.displayName = "LoadingSpinner";
