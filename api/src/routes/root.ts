import express from "express";
const router = express.Router();

router.get(
  "/",
  (req, res): void => {
    res.send(JSON.stringify("Hello, World!"));
  }
);

export default router;