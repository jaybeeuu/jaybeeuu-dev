import type { JSX } from "preact";
import { h } from "preact";
import { asRoute } from "../as-route";
import { useBackgrounds } from "../use-background";

import css from "./home.module.css";

const Home = (): JSX.Element => {
  useBackgrounds({ dark: "bath", light: "english-bay-park" });
  return (
    <div className={css.componentRoot}>
      <p>Hi, I am Josh Bickley-Wallace. I&apos;m a software engineer.</p>
    </div>
  );
};
Home.displayName = "Home";

export const HomeRoute = asRoute(Home);
