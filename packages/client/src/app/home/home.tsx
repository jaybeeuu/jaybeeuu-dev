import type { VNode } from "preact";
import { h } from "preact";
import { asRoute } from "../as-route";
import { useBackgrounds } from "../use-background";

import css from "./home.module.css";

const Home = (): VNode<any> => {
  useBackgrounds({ dark: "bath", light: "englishBayPark" });
  return (
    <div className={css.componentRoot}>
      <p>
        Hi, I am Josh Bickley-Wallace. I&apos;m a software engineer.
      </p>
    </div>
  );
};

export const HomeRoute = asRoute(Home);
