import express from "express";
import { allowCors, HttpMethod } from "../cors";
const router = express.Router();



router.get(
  "/",
  allowCors({ methods: [HttpMethod.GET] }),
  (req, res): void => {
    setTimeout(() => {
      res.header("Cache-Control", "no-cache");
      res.send(JSON.stringify("pong"));
    }, 3500);
  }
);

export default router;