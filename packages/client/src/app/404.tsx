import type { VNode } from "preact";
import { h } from "preact";
import { asRoute } from "./as-route";
import { ErrorMessage } from "./error";
import { useBackgrounds } from "./use-background";

export const FouOhFour = asRoute((): VNode => {
  useBackgrounds({ dark: "galaxy", light: "harmonyRidge" });
  return (
    <ErrorMessage
      heading="Whoops! That's a 404."
      message="Sorry, there isn't anything here."
    />
  );
});
