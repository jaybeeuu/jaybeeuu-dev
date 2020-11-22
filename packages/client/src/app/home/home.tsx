import { h, VNode } from "preact";
import { asRoute } from "../as-route";

const Home = (): VNode<any> => {
  return <div>
    Home sweet home
  </div>;
};

export const HomeRoute = asRoute(Home);
