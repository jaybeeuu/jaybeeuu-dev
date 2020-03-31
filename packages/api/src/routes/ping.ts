import express from "express";
const router = express.Router();

router.get(
  "/",
  (req, res): void => {
    res.send(JSON.stringify("pong"));
  }
);

export default router;