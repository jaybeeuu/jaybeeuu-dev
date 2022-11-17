import type { JSX } from "preact";
import { h } from "preact";
import { asRoute } from "./as-route";
import { ErrorMessage } from "./error";
import { useBackgrounds } from "./use-background";

export const FouOhFour = asRoute((): JSX.Element => {
  useBackgrounds({ dark: "galaxy", light: "harmony-ridge" });
  return (
    <ErrorMessage
      heading="Whoops! That's a 404."
      message="Sorry, there isn't anything here."
    />
  );
});
