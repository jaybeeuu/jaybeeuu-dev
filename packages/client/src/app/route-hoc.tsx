import { FunctionComponent, ComponentType, h, VNode } from "preact";
import { getDisplayName } from "../utils/component";

export type RouteProps = { path: string };

export const asRoute = <PathParams extends string, WrappedComponentProps extends {}>(
  WrappedComponent: ComponentType<WrappedComponentProps>
): FunctionComponent<RouteProps & Omit<WrappedComponentProps, PathParams>> => {
  const AsRoute = ({ path, ...componentProps }: RouteProps & Omit<WrappedComponentProps, PathParams>): VNode => (
    // TODO: Can i avoid having to cast the props?
    // @ts-expect-error
    <WrappedComponent {...componentProps} />
  );
  AsRoute.displayName = `AsRoute(${getDisplayName(WrappedComponent)})`;

  return AsRoute;
};
