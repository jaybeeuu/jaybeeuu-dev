import { log } from "@jaybeeuu/utilities";
import type { VNode } from "preact";
import { h } from "preact";
import { useEffect } from "preact/hooks";
import { ErrorMessage } from "./error-message";

export interface ErrorProps {
  error: Error | { [value: string]: Error };
  message: string;
}

const ErrorComponent = ({
  error,
  message
}: ErrorProps): VNode<any> => {
  useEffect(() => {
    log.error(message);
    if (error instanceof Error) {
      log.error(error);
    } else {
      Object.entries(error).forEach(([source, err]) => {
        log.error(`${source}:`, err);
      });
    }
  }, [error]);

  return (
    <ErrorMessage
      heading={"Whoops! Sorry about this, something's gone wrong..."}
      message={
        error instanceof Error
          ? error.message
          : Object.entries(error).map(
            ([source, err]) => `${source}: ${err.message}`
          )
      }
    />
  );
};
ErrorComponent.displayName = "Error";

export { ErrorComponent as Error };
