import { h, ComponentChildren, JSX } from "preact";
import { useValue } from "../recoilless/use-value";
import { theme as themeSeed } from "./state";

export const Theme = ({ children }: { children: ComponentChildren }): JSX.Element => {
  const [theme] = useValue(themeSeed);
  return (
    <div id="theme-root" className={theme}>
      {children}
    </div>
  );
};
Theme.displayName = "Theme";
