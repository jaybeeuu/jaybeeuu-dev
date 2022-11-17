import type { FunctionComponent, ComponentType, JSX } from "preact";
import { h } from "preact";
import { getDisplayName } from "../utils/component";

export type RouteProps = {
  path: string;
} | {
  default: true;
};

export const asRoute = <PathParams extends string, WrappedComponentProps extends {}>(
  WrappedComponent: ComponentType<WrappedComponentProps>
): FunctionComponent<RouteProps & Omit<WrappedComponentProps, PathParams>> => {
  const AsRoute = (
    props: RouteProps & Omit<WrappedComponentProps, PathParams>
  ): JSX.Element => (
    // @ts-expect-error
    <WrappedComponent {...props} />
  );
  AsRoute.displayName = `AsRoute(${getDisplayName(WrappedComponent)})`;

  return AsRoute;
};
