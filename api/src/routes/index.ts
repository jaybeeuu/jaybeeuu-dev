import root from './root';
import { Express, Router } from 'express';

const routes: { [route: string]: Router } = {
  '/': root
};

const registerRoutes = (app: Express ): void => {
  Object.entries(routes).forEach(([route, router]) => {
    app.use(route, router);
  });
};

export default registerRoutes;