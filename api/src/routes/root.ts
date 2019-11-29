import express from "express";
const router = express.Router();

router.get(
  "/",
  (req, res): void => {
    res.send("Hello, World!");
  }
);

export default router;