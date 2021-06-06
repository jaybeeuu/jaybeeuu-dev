import type { VNode, ComponentType, FunctionComponent } from "preact";
import { h } from "preact";
import type { PromiseState} from "./promise-status";
import { combinePromises } from "./promise-status";

export type MaybePromises<ContentProps extends object> = {
  [Key in keyof ContentProps]: PromiseState<ContentProps[Key]> | ContentProps[Key];
}

export interface FailedProps {
  error: Error | { [value: string]: Error }
}

export interface WithPromiseComponents<ContentProps> {
  Pending: ComponentType<{}>;
  Slow: ComponentType<{}>;
  Failed: ComponentType<FailedProps>;
  Content: ComponentType<ContentProps>;
}

export const withPromise = <ContentProps extends object>(
  { Pending, Slow, Failed, Content }: WithPromiseComponents<ContentProps>
): FunctionComponent<MaybePromises<ContentProps>> => {
  const FetchCompleteComponent = (
    ownProps: MaybePromises<ContentProps>
  ): VNode<any> | null => {
    const promise = combinePromises(ownProps);
    switch (promise.status)
    {
      case "pending": return <Pending />;
      case "slow": return <Slow />;
      case "complete": {
        // @ts-expect-error
        return <Content {...promise.value}/>;
      }
      case "failed": return <Failed error={promise.error} />;
    }
  };

  FetchCompleteComponent.displayName = `WithRequest(${Content.displayName ?? Content.name})`;

  return FetchCompleteComponent;
};
