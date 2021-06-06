import type { FunctionComponent, ComponentType, VNode } from "preact";
import { h } from "preact";
import { getDisplayName } from "../utils/component";

export type RouteProps = { path: string };

export const asRoute = <PathParams extends string, WrappedComponentProps extends {}>(
  WrappedComponent: ComponentType<WrappedComponentProps>
): FunctionComponent<RouteProps & Omit<WrappedComponentProps, PathParams>> => {
  const AsRoute = ({ path, ...componentProps }: RouteProps & Omit<WrappedComponentProps, PathParams>): VNode => (
    // @ts-expect-error
    <WrappedComponent {...componentProps} />
  );
  AsRoute.displayName = `AsRoute(${getDisplayName(WrappedComponent)})`;

  return AsRoute;
};
