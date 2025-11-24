export interface ImageMeta {
  size: number;
  width: number;
  height: number;
}

export interface ImageInfo {
  imageId: string;
  filename: string;
  status: "uploaded" | "processing" | "done" | "error";
  metadata?: ImageMeta;
  labels?: string[];
}

export interface Job {
  jobId: string;
  status: "pending" | "processing" | "done";
  images: ImageInfo[];
  createdAt: string;
  updatedAt: string;
}

