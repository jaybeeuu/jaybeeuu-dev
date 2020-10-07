import { h, JSX } from "preact";

export const LoadingSpinner = (): JSX.Element => (
  <div className="fade-in">
    <div className="spinner"/>
  </div>
);
LoadingSpinner.displayName = "LoadingSpinner";
