import { log } from "@jaybeeuu/utilities";
import type { VNode } from "preact";
import { h } from "preact";
import { useEffect } from "preact/hooks";

import css from "./error.module.css";

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
    <div>
      <h1 className={css.heading}>Whoops! Sorry about this, something&apos;s gone wrong...</h1>
      {
        error instanceof Error
          ? <p className={css.paragraph}>{error.message}</p>
          : (
            Object.entries(error).map(([source, err]) => (
              <p
                className={css.paragraph}
                key={source}
              >
                {source}: {err.message}
              </p>
            ))
          )
      }
    </div>
  );
};
ErrorComponent.displayName = "Error";

export { ErrorComponent as Error };
