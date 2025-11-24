import express from "express";
import { jobs } from "../store/jobsStore";

const router = express.Router();

router.get("/:id", (req, res) => {
  const job = jobs[req.params.id];
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

export default router;

