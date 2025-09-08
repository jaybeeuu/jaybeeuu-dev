import { fourOhFour } from "@jaybeeuu/e2e-hooks";
import type { JSX } from "preact";
import { h } from "preact";
import { ErrorMessage } from "./error";
import { useBackgrounds } from "./use-background";

export const FouOhFour = (): JSX.Element => {
  useBackgrounds({ dark: "galaxy", light: "harmony-ridge" });

  return (
    <ErrorMessage
      className={fourOhFour.root}
      heading="Whoops! That's a 404."
      message="Sorry, there isn't anything here."
    />
  );
};
FouOhFour.displayName = "FourOhFourComponent";

export const FouOhFourRoute = FouOhFour;
