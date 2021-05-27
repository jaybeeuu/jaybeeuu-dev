import type { ComponentType, FunctionComponent } from "preact";
import type { MaybePromises } from "@bickley-wallace/preact-recoilless";
import { withPromise as baseWithPromise } from "@bickley-wallace/preact-recoilless";
import { FailedPromise } from "./failed-promise";
import { LoadingSpinner } from "./loading-spinner";

export const withPromise = <ContentProps extends object>(
  Content: ComponentType<ContentProps>
): FunctionComponent<MaybePromises<ContentProps>> => {
  return baseWithPromise({
    Pending: LoadingSpinner,
    Slow: LoadingSpinner,
    Content,
    Failed: FailedPromise
  });
};
