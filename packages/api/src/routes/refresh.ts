import express from "express";
const router = express.Router();

router.post(
  "/",
  (req, res): void => {
    res.json("Success!");
  }
);

export default router;