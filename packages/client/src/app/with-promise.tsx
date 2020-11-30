import { log } from "@bickley-wallace/utilities";
import { h, VNode, ComponentType, FunctionComponent } from "preact";
import { useEffect } from "preact/hooks";
import { PromiseState, combinePromises } from "@bickley-wallace/preact-recoiless";
import { getDisplayName } from "../utils/component";
import { LoadingSpinner } from "./loading-spinner";

export type MaybePromises<ContentProps extends object> = {
  [Key in keyof ContentProps]: PromiseState<ContentProps[Key]> | ContentProps[Key];
}

export const withPromise = <ContentProps extends object>(
  Content: ComponentType<ContentProps>
): FunctionComponent<MaybePromises<ContentProps>> => {
  const FetchCompleteComponent = (
    ownProps: MaybePromises<ContentProps>
  ): VNode<any> | null => {
    const promise = combinePromises(ownProps);
    switch (promise.status)
    {
      case "pending":
      case "slow": return <LoadingSpinner />;
      case "complete": {
        // @ts-expect-error
        return <Content {...promise.value}/>;
      }
      case "failed": {
        useEffect(() => {
          log.error("Request failed");
          if (promise.error instanceof Error) {
            log.error(promise.error);
          } else {
            Object.entries(promise.error).forEach(([source, error]) => {
              log.error(`${source}:`, error);
            });
          }
        }, [promise]);
        return (
          <div>
            <h2>Whoops! Sorry about this, something&apos;s gone wrong...</h2>
            {
              promise.error instanceof Error ? <h4>{promise.error.message}</h4> : (
                Object.entries(promise.error).map(([source, error]) => (
                  <p key={source}>{source}: {error.message}</p>
                ))
              )
            }
          </div>
        );
      }
    }
  };

  FetchCompleteComponent.displayName = `WithRequest(${getDisplayName(Content)})`;

  return FetchCompleteComponent;
};
