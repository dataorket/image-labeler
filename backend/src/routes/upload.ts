/* backend/src/routes/upload.ts */
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { ImageRecord, UploadJob } from "../shared/types";
import { processJob } from "../workers/worker";
import { jobs } from "../store/jobsStore";

const router = express.Router();

// Always resolve from project root
const STORAGE_DIR = path.resolve(process.cwd(), "storage");
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, STORAGE_DIR),
  filename: (_req, file, cb) =>
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});

const upload = multer({ storage });

router.post("/", upload.array("images"), async (req, res) => {
  const jobId = uuidv4();

  const job: UploadJob = {
    jobId,
    status: "pending",
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  for (const file of req.files as Express.Multer.File[]) {
    job.images.push({
      imageId: uuidv4(),
      filename: file.filename, // UUID-based storage filename
      originalName: file.originalname, // Original uploaded filename
      status: "uploaded"
    });
  }

  jobs[jobId] = job;
  res.json(job);

  // async processing
  const filenames = job.images.map(img => img.filename);
  processJob(filenames).then(processedImages => {
    // Preserve originalName from the job
    processedImages.forEach((processedImg, idx) => {
      processedImg.originalName = job.images[idx].originalName;
    });
    job.images = processedImages;
    job.status = "done";
    job.updatedAt = new Date().toISOString();
    jobs[jobId] = job;
  });
});

router.get("/", (req, res) => {
  const allJobs = Object.values(jobs).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(allJobs);
});

export default router;
