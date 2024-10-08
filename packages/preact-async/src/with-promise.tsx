import type { ComponentType, FunctionComponent, JSX } from "preact";
import { h } from "preact";
import type { PromiseState } from "@jaybeeuu/utilities";
import { combinePromises } from "@jaybeeuu/utilities";

export type MaybePromises<ContentProps extends object> = {
  [Key in keyof ContentProps]:
    | PromiseState<ContentProps[Key]>
    | ContentProps[Key];
};

export interface FailedProps {
  error: Error | { [value: string]: Error };
}

export type PendingComponent = ComponentType;
export type FailedComponent = ComponentType<FailedProps>;
export type ContentComponent<ContentProps> = ComponentType<ContentProps>;

export interface WithPromiseComponents<ContentProps> {
  Pending: PendingComponent;
  Failed: FailedComponent;
  Content: ContentComponent<ContentProps>;
}

export const withPromise = <ContentProps extends object>({
  Pending,
  Failed,
  Content,
}: WithPromiseComponents<ContentProps>): FunctionComponent<
  MaybePromises<ContentProps>
> => {
  const FetchCompleteComponent = (
    ownProps: MaybePromises<ContentProps>,
  ): JSX.Element | null => {
    const promise = combinePromises(ownProps);

    switch (promise.status) {
      case "pending":
        return <Pending />;
      case "complete": {
        // @ts-expect-error Maybe promises is a compound type using the keys on ContentProps, TypeScript is unhappy because it thinks that ContentProps could be a class, but.... it can't it will always be a map.
        return <Content {...promise.value} />;
      }
      case "failed":
        return <Failed error={promise.error} />;
    }
  };

  FetchCompleteComponent.displayName = `WithPromise(${Content.displayName ?? Content.name})`;

  return FetchCompleteComponent;
};
