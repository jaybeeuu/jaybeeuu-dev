import { log } from "@bickley-wallace/utilities";
import { h, VNode, ComponentType, FunctionComponent } from "preact";
import { PromiseState, useCombinePromises } from "../recoilless/promise-status";
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
    const promise = useCombinePromises(ownProps);
    switch (promise.status)
    {
      case "pending":
      case "slow": return <LoadingSpinner />;
      case "complete": {
        // @ts-expect-error
        return <Content {...promise.value}/>;
      }
      case "failed": {
        log.error("Request failed", promise.error);
        return <pre>{JSON.stringify(promise, null, 2)}</pre>;
      }
    }
  };

  FetchCompleteComponent.displayName = `WithRequest(${getDisplayName(Content)})`;

  return FetchCompleteComponent;
};
