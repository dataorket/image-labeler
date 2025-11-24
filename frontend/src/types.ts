export interface ImageMeta {
  size: number;
  width: number;
  height: number;
}

export interface LabelWithScore {
  description: string;
  score: number;
}

export interface DominantColor {
  color: {
    red: number;
    green: number;
    blue: number;
  };
  score: number;
  pixelFraction: number;
}

export interface SafeSearchAnnotation {
  adult: string;
  spoof: string;
  medical: string;
  violence: string;
  racy: string;
}

export interface ImageLabels {
  objects: LabelWithScore[];
  scenes: LabelWithScore[];
  labels: LabelWithScore[];
  dominantColors?: DominantColor[];
  safeSearch?: SafeSearchAnnotation;
}

export interface ImageRecord {
  imageId: string;
  filename: string;  // Storage filename (UUID-based)
  originalName: string;  // Original uploaded filename
  status: "uploaded" | "processing" | "done" | "error";
  metadata?: ImageMeta;
  labels?: ImageLabels;
}

export interface UploadJob {
  jobId: string;
  images: ImageRecord[];
  status: "pending" | "processing" | "done";
  createdAt: string;
  updatedAt: string;
}
