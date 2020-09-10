import { ComponentType } from "preact";

export const getDisplayName = <Props>(Component: ComponentType<Props>): string => {
  return Component.displayName ?? Component.name;
};
