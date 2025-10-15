import express from "express";

const router = express.Router();
router.get("/", (req, res) => {
  res.send("POSTS");
});

export default router;
