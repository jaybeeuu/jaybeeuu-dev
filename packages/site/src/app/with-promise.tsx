import { h } from "preact";
import type { ComponentType, FunctionComponent, VNode } from "preact";
import type { FailedProps, MaybePromises } from "@jaybeeuu/preact-recoilless";
import { withPromise as baseWithPromise } from "@jaybeeuu/preact-recoilless";
import { Error } from "./error/index";
import { LoadingSpinner } from "./loading-spinner";

export const withPromise = <ContentProps extends object>(
  Content: ComponentType<ContentProps>
): FunctionComponent<MaybePromises<ContentProps>> => {
  return baseWithPromise({
    Pending: LoadingSpinner,
    Slow: LoadingSpinner,
    Content,
    Failed: ({ error }: FailedProps): VNode => {
      return <Error error={error} message="Promise Rejected" />;
    }
  });
};
