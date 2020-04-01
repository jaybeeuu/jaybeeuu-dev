import express from "express";
import { withHandledErrors } from "./with-handled-errors";

const router = express.Router();

router.get(
  "/",
  (req, res): void => {
    res.json({});
  }
);

router.get(
  "/:name",
  withHandledErrors((requesst, response): void => {
    // const name = requesst.params.naem;
    // response.sendFile(name, {
    //   dotfiles: "deny",

    // })
  })
);

export default router;