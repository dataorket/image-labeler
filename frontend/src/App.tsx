import { useState, useEffect } from "react";
import axios from "axios";
import type { UploadJob } from "./types";
import { ImageCard } from "./ImageCard";
import "./App.css";

const API_URL = "https://image-labeler-backend-325931483644.us-central1.run.app";

export default function App() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [currentJob, setCurrentJob] = useState<UploadJob | null>(null);
  const [allJobs, setAllJobs] = useState<UploadJob[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "history">("upload");

  // Fetch all jobs on mount
  useEffect(() => {
    fetchAllJobs();
  }, []);

  // Poll current job for updates
  useEffect(() => {
    if (!currentJob || currentJob.status === "done") return;
    
    const interval = setInterval(async () => {
      try {
        const res = await axios.get<UploadJob>(`${API_URL}/jobs/${currentJob.jobId}`);
        setCurrentJob(res.data);
        
        // Also update in allJobs list
        setAllJobs(prev => prev.map(j => j.jobId === res.data.jobId ? res.data : j));
      } catch (err) {
        console.error("Error polling job:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentJob]);

  const fetchAllJobs = async () => {
    try {
      const res = await axios.get<UploadJob[]>(`${API_URL}/api`);
      setAllJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const upload = async () => {
    if (!files) return;
    
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append("images", f));
    
    try {
      const res = await axios.post<UploadJob>(`${API_URL}/api`, formData);
      setCurrentJob(res.data);
      setAllJobs(prev => [res.data, ...prev]);
      setFiles(null);
    } catch (err) {
      console.error("Error uploading:", err);
    } finally {
      setUploading(false);
    }
  };

  const viewJob = async (jobId: string) => {
    try {
      const res = await axios.get<UploadJob>(`${API_URL}/jobs/${jobId}`);
      setCurrentJob(res.data);
      setSelectedJobId(jobId);
    } catch (err) {
      console.error("Error fetching job:", err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getJobProgress = (job: UploadJob) => {
    const done = job.images.filter(img => img.status === "done").length;
    return `${done}/${job.images.length}`;
  };

  const clearAll = () => {
    setCurrentJob(null);
    setSelectedJobId(null);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", width: "100vw", margin: 0 }}>
      {/* Header */}
      <header style={{ 
        background: "rgba(255, 255, 255, 0.98)", 
        padding: "20px 40px", 
        borderBottom: "1px solid #e0e0e0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div 
            onClick={() => setActiveTab("upload")}
            style={{ cursor: "pointer", transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            <h1 style={{ margin: 0, fontSize: "26px", color: "#6f42c1", fontWeight: 700 }}>
              🖼️ Image Analysis & Labeling Service
            </h1>
            <p style={{ margin: "5px 0 0 0", color: "#666", fontSize: "14px" }}>
              Powered by Google Cloud Vision API
            </p>
          </div>
          
          {/* Navigation Tabs */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setActiveTab("upload")}
              style={{
                padding: "10px 24px",
                border: "none",
                background: activeTab === "upload" ? "#6f42c1" : "transparent",
                color: activeTab === "upload" ? "white" : "#666",
                fontSize: "15px",
                fontWeight: activeTab === "upload" ? "700" : "500",
                cursor: "pointer",
                borderRadius: 8,
                transition: "all 0.2s",
                boxShadow: activeTab === "upload" ? "0 2px 8px rgba(111, 66, 193, 0.3)" : "none"
              }}
            >
              📤 Upload
            </button>
            <button
              onClick={() => setActiveTab("history")}
              style={{
                padding: "10px 24px",
                border: "none",
                background: activeTab === "history" ? "#6f42c1" : "transparent",
                color: activeTab === "history" ? "white" : "#666",
                fontSize: "15px",
                fontWeight: activeTab === "history" ? "700" : "500",
                cursor: "pointer",
                borderRadius: 8,
                transition: "all 0.2s",
                boxShadow: activeTab === "history" ? "0 2px 8px rgba(111, 66, 193, 0.3)" : "none"
              }}
            >
              📜 History
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Two Pane Layout */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", width: "100%" }}>
        
        {/* Left Pane - Upload & Controls */}
        <div style={{ 
          width: "400px", 
          background: "white", 
          borderRight: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          {/* Tab Content */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {activeTab === "upload" ? (
              <>
                {/* Upload Section */}
                <div style={{ padding: 30, borderBottom: "1px solid #f0f0f0" }}>
                  <h2 style={{ marginTop: 0, fontSize: "18px", color: "#333", marginBottom: 20 }}>
                    Upload Images
                  </h2>
                  
                  <div style={{ 
                    border: "2px dashed #ccc", 
                    borderRadius: 8, 
                    padding: 40,
                    textAlign: "center",
                    background: "#fafafa",
                    marginBottom: 15,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#6f42c1";
                    e.currentTarget.style.background = "#f3e5f5";
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.style.borderColor = "#ccc";
                    e.currentTarget.style.background = "#fafafa";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#ccc";
                    e.currentTarget.style.background = "#fafafa";
                    if (e.dataTransfer.files) {
                      setFiles(e.dataTransfer.files);
                    }
                  }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 10 }}>📁</div>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={e => setFiles(e.target.files)}
                      id="fileInput"
                      style={{ display: "none" }}
                    />
                    <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                      <div style={{ color: "#6f42c1", fontWeight: 500, marginBottom: 5 }}>
                        Choose files or drag here
                      </div>
                      <div style={{ fontSize: "13px", color: "#999" }}>
                        Supports: JPG, PNG, GIF
                      </div>
                    </label>
                  </div>

                  {files && (
                    <div style={{ 
                      padding: 15, 
                      background: "#f3e5f5", 
                      borderRadius: 4, 
                      marginBottom: 15,
                      fontSize: "14px",
                      border: "1px solid #ce93d8"
                    }}>
                      <strong>{files.length}</strong> file(s) selected
                    </div>
                  )}

                  <button 
                    onClick={upload} 
                    disabled={!files || uploading}
                    style={{ 
                      width: "100%",
                      padding: "14px",
                      background: files && !uploading ? "#6f42c1" : "#ccc",
                      color: "white",
                      border: "none",
                      borderRadius: 6,
                      fontSize: "15px",
                      fontWeight: 600,
                      cursor: files && !uploading ? "pointer" : "not-allowed",
                      transition: "all 0.2s"
                    }}
                  >
                    {uploading ? "⏳ Uploading..." : "🚀 Upload & Analyze"}
                  </button>
                </div>

                {/* Recent Jobs (last 3) */}
                <div style={{ padding: 30 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
                      Recent Jobs
                    </h2>
                    <button 
                      onClick={fetchAllJobs}
                      style={{
                        padding: "6px 12px",
                        background: "#f5f5f5",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: "13px"
                      }}
                    >
                      🔄
                    </button>
                  </div>

                  {allJobs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                      <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
                      <div>No jobs yet</div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {allJobs.slice(0, 3).map(job => (
                  <div 
                    key={job.jobId}
                    onClick={() => viewJob(job.jobId)}
                    style={{
                      padding: 15,
                      background: selectedJobId === job.jobId ? "#f3e5f5" : "#fafafa",
                      border: selectedJobId === job.jobId ? "2px solid #6f42c1" : "1px solid #e0e0e0",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-start" }}>
                      <div style={{ flex: 1, marginRight: 10 }}>
                        <div style={{ fontSize: "12px", color: "#666", fontFamily: "monospace", marginBottom: 4 }}>
                          {job.jobId.substring(0, 8)}...
                        </div>
                        {job.images.length > 0 && job.images[0].originalName && (
                          <div style={{ fontSize: "13px", color: "#6f42c1", fontWeight: 600, wordBreak: "break-word" }}>
                            {job.images[0].originalName}
                            {job.images.length > 1 && ` +${job.images.length - 1} more`}
                          </div>
                        )}
                      </div>
                      <span style={{ 
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: 12,
                        background: job.status === "done" ? "#4caf50" : job.status === "pending" ? "#ff9800" : "#6f42c1",
                        color: "white",
                        fontWeight: 600,
                        whiteSpace: "nowrap"
                      }}>
                        {job.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#333", marginBottom: 5 }}>
                      {job.images.length} image{job.images.length > 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      {new Date(job.createdAt).toLocaleString()}
                    </div>
                    <div style={{ 
                      marginTop: 8,
                      fontSize: "12px",
                      color: "#6f42c1",
                      fontWeight: 500
                    }}>
                      Progress: {getJobProgress(job)}
                    </div>
                  </div>
                ))}
              </div>
            )}
                </div>
              </>
            ) : (
              /* History Tab - All Jobs */
              <div style={{ padding: 30 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h2 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
                    All Jobs
                  </h2>
                  <button 
                    onClick={fetchAllJobs}
                    style={{
                      padding: "6px 12px",
                      background: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: "13px"
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>

                {allJobs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                    <div style={{ fontSize: 48, marginBottom: 10 }}>📭</div>
                    <div>No jobs yet</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {allJobs.map(job => (
                      <div 
                        key={job.jobId}
                        onClick={() => viewJob(job.jobId)}
                        style={{
                          padding: 15,
                          background: selectedJobId === job.jobId ? "#f3e5f5" : "#fafafa",
                          border: selectedJobId === job.jobId ? "2px solid #6f42c1" : "1px solid #e0e0e0",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "flex-start" }}>
                          <div style={{ flex: 1, marginRight: 10 }}>
                            <div style={{ fontSize: "12px", color: "#666", fontFamily: "monospace", marginBottom: 4 }}>
                              {job.jobId.substring(0, 8)}...
                            </div>
                            {job.images.length > 0 && job.images[0].originalName && (
                              <div style={{ fontSize: "13px", color: "#6f42c1", fontWeight: 600, wordBreak: "break-word" }}>
                                {job.images[0].originalName}
                                {job.images.length > 1 && ` +${job.images.length - 1} more`}
                              </div>
                            )}
                          </div>
                          <span style={{ 
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: 12,
                            background: job.status === "done" ? "#4caf50" : job.status === "pending" ? "#ff9800" : "#6f42c1",
                            color: "white",
                            fontWeight: 600,
                            whiteSpace: "nowrap"
                          }}>
                            {job.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#333", marginBottom: 5 }}>
                          {job.images.length} image{job.images.length > 1 ? "s" : ""}
                        </div>
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          {new Date(job.createdAt).toLocaleString()}
                        </div>
                        <div style={{ 
                          marginTop: 8,
                          fontSize: "12px",
                          color: "#6f42c1",
                          fontWeight: 500
                        }}>
                          Progress: {getJobProgress(job)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Results */}
        <div style={{ flex: 1, overflow: "auto", background: "transparent", width: "100%" }}>
          {activeTab === "history" ? (
            /* History View - Grid of All Images */
            <div style={{ padding: 40, width: "100%" }}>
              <h2 style={{ 
                margin: "0 0 30px 0", 
                fontSize: "28px", 
                color: "white", 
                fontWeight: 700,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }}>
                📜 All Uploaded Images
              </h2>
              
              {allJobs.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  padding: "100px 20px", 
                  color: "white"
                }}>
                  <div style={{ fontSize: 80, marginBottom: 20 }}>📭</div>
                  <h3 style={{ margin: 0, fontWeight: 400 }}>No images uploaded yet</h3>
                  <p style={{ marginTop: 10, fontSize: "16px", opacity: 0.8 }}>Start by uploading some images</p>
                </div>
              ) : (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(4, 1fr)", 
                  gap: 20, 
                  width: "100%" 
                }}>
                  {allJobs.flatMap(job => 
                    job.images.map(img => ({ ...img, uploadedAt: job.createdAt }))
                  ).map((img) => (
                    <div 
                      key={img.imageId}
                      onClick={() => {
                        // Find the job containing this image
                        const job = allJobs.find(j => j.images.some(i => i.imageId === img.imageId));
                        if (job) {
                          setSelectedJobId(job.jobId);
                          setCurrentJob(job);
                        }
                      }}
                      style={{
                        background: "rgba(255, 255, 255, 0.98)",
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transition: "transform 0.2s",
                        cursor: "pointer"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                    >
                      <img 
                        src={`${API_URL}/images/${img.filename}`} 
                        alt={img.originalName || img.filename}
                        style={{ 
                          width: "100%", 
                          height: 200, 
                          objectFit: "cover" 
                        }}
                      />
                      <div style={{ padding: 15 }}>
                        <div style={{ 
                          fontSize: "14px", 
                          fontWeight: 700, 
                          color: "#6f42c1",
                          marginBottom: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {img.originalName || img.filename}
                        </div>
                        <div style={{ fontSize: "11px", color: "#999", marginBottom: 8 }}>
                          {new Date(img.uploadedAt).toLocaleString()}
                        </div>
                        {img.metadata && (
                          <div style={{ fontSize: "12px", color: "#999", marginBottom: 8 }}>
                            {img.metadata.width} × {img.metadata.height}px
                          </div>
                        )}
                        {img.labels?.objects && img.labels.objects.length > 0 && (
                          <div style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                            borderRadius: 12,
                            fontSize: "12px",
                            color: "#6f42c1",
                            fontWeight: 600
                          }}>
                            🏷️ {img.labels.objects[0].description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : currentJob ? (
            <div style={{ padding: 40, width: "100%" }}>
              {/* Results Header */}
              <div style={{ 
                background: "rgba(255, 255, 255, 0.98)", 
                padding: 25, 
                borderRadius: 12,
                marginBottom: 30,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: "22px", color: "#6f42c1", fontWeight: 700 }}>
                      Analysis Results
                    </h2>
                    <div style={{ marginTop: 10, fontSize: "14px", color: "#666" }}>
                      Job ID: <span style={{ fontFamily: "monospace", color: "#6f42c1", fontWeight: 600 }}>{currentJob.jobId}</span>
                    </div>
                  </div>
                  <button 
                    onClick={clearAll}
                    style={{ 
                      padding: "10px 20px", 
                      background: "#d32f2f", 
                      color: "white", 
                      border: "none", 
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 600,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}
                  >
                    🗑️ Clear Results
                  </button>
                </div>

                <div style={{ 
                  marginTop: 15, 
                  padding: 15,
                  background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                  borderRadius: 8,
                  display: "flex",
                  gap: 30
                }}>
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: 5, fontWeight: 600 }}>STATUS</div>
                    <div style={{ 
                      fontSize: "14px", 
                      fontWeight: 700,
                      color: currentJob.status === "done" ? "#4caf50" : "#ff9800"
                    }}>
                      {currentJob.status.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: 5, fontWeight: 600 }}>IMAGES</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#333" }}>
                      {currentJob.images.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: 5, fontWeight: 600 }}>PROGRESS</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#6f42c1" }}>
                      {getJobProgress(currentJob)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: "#666", marginBottom: 5, fontWeight: 600 }}>CREATED</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#333" }}>
                      {new Date(currentJob.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Images Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20, width: "100%" }}>
                {currentJob.images.map((img) => (
                  <ImageCard key={img.imageId} img={img} formatBytes={formatBytes} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ 
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "white",
              padding: "40px"
            }}>
              <div style={{ fontSize: 80, marginBottom: 20 }}>🔍</div>
              <h3 style={{ margin: 0, fontWeight: 400, fontSize: "24px" }}>No results to display</h3>
              <p style={{ marginTop: 10, fontSize: "16px", opacity: 0.9 }}>Upload images or select a job from the history</p>
              
              <div style={{ 
                marginTop: 40, 
                padding: "30px 40px", 
                background: "rgba(255, 255, 255, 0.95)", 
                borderRadius: 12,
                maxWidth: "600px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                <h4 style={{ margin: "0 0 15px 0", color: "#6f42c1", fontSize: "20px", fontWeight: 700 }}>
                  🎯 Goal
                </h4>
                <ul style={{ margin: 0, paddingLeft: "20px", color: "#666", fontSize: "14px", lineHeight: "1.8" }}>
                  <li>Upload single/multiple images</li>
                  <li>Track upload and processing progress</li>
                  <li>View image previews, metadata, and labels</li>
                  <li>See a list of all uploads and their statuses</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
