import { h, VNode } from "preact";
import { asRoute } from "../as-route";
import { useBackgrounds } from "../use-background";

const Home = (): VNode<any> => {
  useBackgrounds({ dark: "bath", light: "englishBayPark" });
  return <div>Home sweet home</div>;
};

export const HomeRoute = asRoute(Home);
