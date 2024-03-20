import type { FunctionComponent, ComponentType, JSX } from "preact";
import { h } from "preact";
import { getDisplayName } from "../utils/component";

export type RouteProps =
  | {
      path: string;
    }
  | {
      default: true;
    };

export const asRoute = <
  PathParams extends string,
  WrappedComponentProps extends object,
>(
  WrappedComponent: ComponentType<WrappedComponentProps>,
): FunctionComponent<RouteProps & Omit<WrappedComponentProps, PathParams>> => {
  const AsRoute = (
    props: RouteProps & Omit<WrappedComponentProps, PathParams>,
  ): JSX.Element => (
    // @ts-expect-error TypeScript errors because WrappedComponentProps
    // could require a specific class, which would be unfulfilled by
    // the props passed into asRoute. In practice however since
    // WrappedComponent is a react component, it will require only a
    // simple object.
    <WrappedComponent {...props} />
  );
  AsRoute.displayName = `AsRoute(${getDisplayName(WrappedComponent)})`;

  return AsRoute;
};
