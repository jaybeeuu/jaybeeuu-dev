import { log } from "@bickley-wallace/utilities";
import { h, VNode, ComponentType, FunctionComponent } from "preact";
import { PromiseStatus } from "../recoilless/promise-status";
import { getDisplayName } from "../utils/component";
import { LoadingSpinner } from "./loading-spinner";

export interface OwnProps<Value> {
  promise: PromiseStatus<Value>
}

export interface InjectedProps<Value> {
  value: Value
}

export const withPromise = <Value, ContentProps extends InjectedProps<Value>>(
  Content: ComponentType<ContentProps>
): FunctionComponent<
  Omit<ContentProps, keyof InjectedProps<Value>> & OwnProps<Value>
> => {
  const FetchCompleteComponent = (
    { promise, ...contentProps }: Omit<ContentProps, keyof InjectedProps<Value>> & OwnProps<Value>
  ): VNode<any> | null => {
    switch (promise.status)
    {
      case "pending": return <LoadingSpinner />;
      case "complete": {
        const injectableContentProps = {
          ...contentProps,
          value: promise.value
        };
        // @ts-expect-error
        return <Content {...injectableContentProps}/>;
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
