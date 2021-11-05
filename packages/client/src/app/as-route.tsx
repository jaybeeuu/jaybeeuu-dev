import type { FunctionComponent, ComponentType, VNode } from "preact";
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
  const AsRoute = (props: RouteProps & Omit<WrappedComponentProps, PathParams>): VNode => (
    // @ts-expect-error
    <WrappedComponent {...props} />
  );
  AsRoute.displayName = `AsRoute(${getDisplayName(WrappedComponent)})`;

  return AsRoute;
};
