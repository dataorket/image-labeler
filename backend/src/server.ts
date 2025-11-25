import express from "express";
import cors from "cors";
import path from "path";
import jobsRouter from "./routes/jobs";
import uploadRouter from "./routes/upload";

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/images", express.static(path.join(process.cwd(), "storage")));

app.use("/jobs", jobsRouter);
app.use("/api", uploadRouter);

const PORT = parseInt(process.env.PORT || "8080", 10);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});
