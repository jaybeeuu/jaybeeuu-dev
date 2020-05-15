import express from "express";
import { allowCors, HttpMethod } from "../cors";
const router = express.Router();



router.get(
  "/",
  allowCors({ methods: [HttpMethod.GET] }),
  (req, res): void => {
    res.send(JSON.stringify("pong"));
  }
);

export default router;