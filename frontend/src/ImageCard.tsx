import { useState } from "react";
import type { ImageRecord } from "./types";

const API_URL = "https://image-labeler-backend-325931483644.us-central1.run.app";

interface Props {
  img: ImageRecord;
  formatBytes: (bytes: number) => string;
}

type TabType = "objects" | "labels" | "properties" | "safeSearch";

export function ImageCard({ img, formatBytes }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("objects");
  const [showJSON, setShowJSON] = useState(false);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  const getLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case "Very Unlikely": return "#4caf50";
      case "Unlikely": return "#8bc34a";
      case "Possible": return "#ffc107";
      case "Likely": return "#ff9800";
      case "Very Likely": return "#f44336";
      default: return "#9e9e9e";
    }
  };

  return (
    <div style={{ 
      border: "1px solid #e0e0e0", 
      padding: 20, 
      borderRadius: 12, 
      background: "rgba(255, 255, 255, 0.98)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transition: "all 0.2s"
    }}>
      <h4 style={{ 
        marginTop: 0, 
        marginBottom: 8, 
        fontSize: "16px", 
        color: "#6f42c1", 
        fontWeight: 700,
        wordBreak: "break-word"
      }}>
        {img.originalName || img.filename}
      </h4>
      
      {img.metadata && (
        <div style={{ fontSize: "0.85em", color: "#666", marginBottom: 10 }}>
          {formatBytes(img.metadata.size)} • {img.metadata.width} × {img.metadata.height}px
        </div>
      )}
      
      <img 
        src={`${API_URL}/images/${img.filename}`} 
        alt={img.filename}
        style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 4, marginBottom: 15 }}
      />

      {/* Tabs */}
      {img.labels && (
        <>
          <div style={{ 
            display: "flex", 
            borderBottom: "2px solid #eee", 
            marginBottom: 15,
            gap: 5
          }}>
            <button
              onClick={() => setActiveTab("objects")}
              style={{
                padding: "8px 16px",
                border: "none",
                background: activeTab === "objects" ? "#6f42c1" : "transparent",
                color: activeTab === "objects" ? "white" : "#666",
                borderRadius: "4px 4px 0 0",
                cursor: "pointer",
                fontSize: "0.85em",
                fontWeight: activeTab === "objects" ? "600" : "normal"
              }}
            >
              Objects
            </button>
            <button
              onClick={() => setActiveTab("labels")}
              style={{
                padding: "8px 16px",
                border: "none",
                background: activeTab === "labels" ? "#6f42c1" : "transparent",
                color: activeTab === "labels" ? "white" : "#666",
                borderRadius: "4px 4px 0 0",
                cursor: "pointer",
                fontSize: "0.85em",
                fontWeight: activeTab === "labels" ? "600" : "normal"
              }}
            >
              Labels
            </button>
            <button
              onClick={() => setActiveTab("properties")}
              style={{
                padding: "8px 16px",
                border: "none",
                background: activeTab === "properties" ? "#6f42c1" : "transparent",
                color: activeTab === "properties" ? "white" : "#666",
                borderRadius: "4px 4px 0 0",
                cursor: "pointer",
                fontSize: "0.85em",
                fontWeight: activeTab === "properties" ? "600" : "normal"
              }}
            >
              Properties
            </button>
            <button
              onClick={() => setActiveTab("safeSearch")}
              style={{
                padding: "8px 16px",
                border: "none",
                background: activeTab === "safeSearch" ? "#6f42c1" : "transparent",
                color: activeTab === "safeSearch" ? "white" : "#666",
                borderRadius: "4px 4px 0 0",
                cursor: "pointer",
                fontSize: "0.85em",
                fontWeight: activeTab === "safeSearch" ? "600" : "normal"
              }}
            >
              Safe Search
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ minHeight: 150 }}>
            {activeTab === "objects" && (
              <div>
                {img.labels.scenes && img.labels.scenes.length > 0 && (
                  <div style={{ marginBottom: 15 }}>
                    <div style={{ 
                      fontSize: "0.85em", 
                      fontWeight: "600", 
                      color: "#666", 
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Scene Type
                    </div>
                    {img.labels.scenes.map((label, idx) => (
                      <div key={idx} style={{ padding: "6px 0", fontSize: "0.9em", color: "#333" }}>
                        {label.description}
                      </div>
                    ))}
                  </div>
                )}
                
                {img.labels.objects && img.labels.objects.length > 0 && (
                  <div>
                    <div style={{ 
                      fontSize: "0.85em", 
                      fontWeight: "600", 
                      color: "#666", 
                      marginBottom: 8,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>
                      Detected Objects
                    </div>
                    {img.labels.objects.map((label, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: "6px 0",
                          fontSize: "0.9em",
                          color: "#333",
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <span>{label.description}</span>
                        <span style={{ color: "#1976d2", fontWeight: "500" }}>
                          ({label.score}%)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "labels" && img.labels.labels && (
              <div>
                {img.labels.labels.map((label, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      padding: "6px 0",
                      fontSize: "0.9em",
                      color: "#333",
                      display: "flex",
                      justifyContent: "space-between",
                      borderBottom: idx < img.labels!.labels.length - 1 ? "1px solid #f0f0f0" : "none"
                    }}
                  >
                    <span>{label.description}</span>
                    <span style={{ color: "#1976d2", fontWeight: "500" }}>
                      {label.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "properties" && img.labels.dominantColors && (
              <div>
                <div style={{ 
                  fontSize: "0.85em", 
                  fontWeight: "600", 
                  color: "#666", 
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Dominant Colors
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {img.labels.dominantColors.map((colorInfo, idx) => {
                    const hex = rgbToHex(colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue);
                    return (
                      <div key={idx} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: hex,
                            borderRadius: 4,
                            border: "1px solid #ddd",
                            marginBottom: 5
                          }}
                        />
                        <div style={{ fontSize: "0.75em", color: "#666" }}>
                          {hex}
                        </div>
                        <div style={{ fontSize: "0.7em", color: "#999" }}>
                          {Math.round(colorInfo.pixelFraction * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "safeSearch" && img.labels.safeSearch && (
              <div>
                <div style={{ 
                  fontSize: "0.85em", 
                  fontWeight: "600", 
                  color: "#666", 
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Safe Search Detection
                </div>
                {Object.entries(img.labels.safeSearch).map(([key, value]) => (
                  <div 
                    key={key}
                    style={{ 
                      padding: "8px 0",
                      fontSize: "0.9em",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #f0f0f0"
                    }}
                  >
                    <span style={{ textTransform: "capitalize" }}>{key}</span>
                    <span 
                      style={{ 
                        color: getLikelihoodColor(value),
                        fontWeight: "500",
                        padding: "4px 8px",
                        borderRadius: 4,
                        background: getLikelihoodColor(value) + "20"
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: 15, display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowJSON(!showJSON)}
              style={{
                padding: "8px 16px",
                background: showJSON ? "#6f42c1" : "#f3e5f5",
                border: showJSON ? "none" : "1px solid #ce93d8",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.85em",
                color: showJSON ? "white" : "#6f42c1",
                fontWeight: 600
              }}
            >
              {showJSON ? "Hide JSON" : "Show JSON"}
            </button>
          </div>

          {showJSON && (
            <pre style={{ 
              marginTop: 10, 
              padding: 15, 
              background: "#f3e5f5", 
              borderRadius: 8, 
              fontSize: "0.75em",
              overflow: "auto",
              maxHeight: 300,
              border: "1px solid #ce93d8"
            }}>
              {JSON.stringify(img.labels, null, 2)}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
