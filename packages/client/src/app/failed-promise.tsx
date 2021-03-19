import { FailedProps } from "@bickley-wallace/preact-recoilless";
import { log } from "@bickley-wallace/utilities";
import { h, VNode } from "preact";
import { useEffect } from "preact/hooks";

export const FailedPromise = ({ error }: FailedProps): VNode<any> => {
  useEffect(() => {
    log.error("Request failed");
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
      <h2>Whoops! Sorry about this, something&apos;s gone wrong...</h2>
      {
        error instanceof Error ? <h4>{error.message}</h4> : (
          Object.entries(error).map(([source, err]) => (
            <p key={source}>{source}: {err.message}</p>
          ))
        )
      }
    </div>
  );
};

FailedPromise.displayName = "FailedPromise";
