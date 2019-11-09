import express from "express";
import cookieParser from "cookie-parser";
import { Server } from "http";

export default async (port): Promise<Server> => {
  const app = express();

  app.use(express.static("public"));
  app.use(cookieParser());

  app.get(
    "/",
    (req, res) => res.send("Hello, World!")
  );

  const server: Server = await new Promise((resolve) => {
    const innerServer = app.listen(
      port,
      () => { resolve(innerServer); }
    );
  });

  console.log(`Listening on port ${port}!`);

  return server;
};
