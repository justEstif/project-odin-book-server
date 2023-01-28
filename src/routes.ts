import { Router } from "express";

const router = Router();

router.route("/").get((_req, res) => {
  res.json(["GET /"]);
});

export default router;
