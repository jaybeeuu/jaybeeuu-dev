import express from "express";
const router = express.Router();

router.get(
  "/",
  (req, res): void => {
    res.json({});
  }
);

export default router;