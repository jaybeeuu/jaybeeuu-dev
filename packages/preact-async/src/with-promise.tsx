import type { ComponentType, FunctionComponent, JSX } from "preact";
import { h } from "preact";
import type { PromiseState } from "@jaybeeuu/utilities";
import { combinePromises } from "@jaybeeuu/utilities";

export type MaybePromises<ContentProps extends object> = {
  [Key in keyof ContentProps]: PromiseState<ContentProps[Key]> | ContentProps[Key];
}

export interface FailedProps {
  error: Error | { [value: string]: Error }
}

export type PendingComponent = ComponentType<{}>;
export type SlowComponent = ComponentType<{}>;
export type FailedComponent = ComponentType<FailedProps>;
export type ContentComponent<ContentProps> = ComponentType<ContentProps>;

export interface WithPromiseComponents<ContentProps> {
  Pending: PendingComponent;
  Slow: SlowComponent;
  Failed: FailedComponent;
  Content: ContentComponent<ContentProps>;
}

export const withPromise = <ContentProps extends object>(
  { Pending, Slow, Failed, Content }: WithPromiseComponents<ContentProps>
): FunctionComponent<MaybePromises<ContentProps>> => {
  const FetchCompleteComponent = (
    ownProps: MaybePromises<ContentProps>
  ): JSX.Element | null => {
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
