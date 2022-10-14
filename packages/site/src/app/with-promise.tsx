import { h } from "preact";
import type { ComponentType, FunctionComponent, JSX } from "preact";
import type {
  FailedProps,
  MaybePromises,
  PendingComponent,
  SlowComponent
} from "@jaybeeuu/preact-async";
import {
  withPromise as baseWithPromise
} from "@jaybeeuu/preact-async";
import { Error } from "./error/index";
import { LoadingSpinner } from "./loading-spinner";

export const withPromise = <ContentProps extends object>(
  Content: ComponentType<ContentProps>,
  {
    Pending = LoadingSpinner,
    Slow = LoadingSpinner
  }: {
    Pending?: PendingComponent,
    Slow?: SlowComponent,
  } = {}
): FunctionComponent<MaybePromises<ContentProps>> => {
  return baseWithPromise({
    Pending,
    Slow,
    Content,
    Failed: ({ error }: FailedProps): JSX.Element => {
      return <Error error={error} message="Promise Rejected" />;
    }
  });
};
