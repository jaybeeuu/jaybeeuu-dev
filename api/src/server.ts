import express from "express";
import cookieParser from "cookie-parser";

export default async (port) => {
  const app = express();

  app.use(express.static("public"));
  app.use(cookieParser());

  app.get(
    "/",
    (req, res) => res.send("Hello World!")
  );

  await new Promise(
    (resolve) => app.listen(port, resolve)
  );

  console.log(`Listening on port ${port}!`);
};
