import { Express, Router } from "express";
import ping from "./ping";
import posts from "./posts";
import refresh from "./refresh";

const routes: { [route: string]: Router } = {
  "/ping": ping,
  "/posts": posts,
  "/refresh": refresh
};

const registerRoutes = (app: Express ): void => {
  Object.entries(routes).forEach(([route, router]) => {
    app.use(route, router);
  });
};

export default registerRoutes;