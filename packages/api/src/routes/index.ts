import { Express, Router } from "express";
import root from "./root";
import posts from "./posts";

const routes: { [route: string]: Router } = {
  "/": root,
  "/posts": posts
};

const registerRoutes = (app: Express ): void => {
  Object.entries(routes).forEach(([route, router]) => {
    app.use(route, router);
  });
};

export default registerRoutes;