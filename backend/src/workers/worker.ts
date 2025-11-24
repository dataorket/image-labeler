import fs from "fs";
import path from "path";
import sizeOf from "image-size";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { ImageRecord, ImageMeta, ImageLabels, LabelWithScore, DominantColor, SafeSearchAnnotation } from "../shared/types";

const client = new ImageAnnotatorClient();

// Scene-related keywords and primary subject keywords
const SCENE_KEYWORDS = [
  'selfie', 'portrait', 'landscape', 'indoor', 'outdoor', 'nature', 
  'city', 'urban', 'sky', 'sunset', 'sunrise', 'night', 'daytime',
  'architecture', 'street', 'beach', 'mountain', 'forest', 'desert',
  'water', 'ocean', 'lake', 'river', 'building', 'room', 'home',
  'garden', 'park', 'countryside', 'wilderness', 'scenery', 'vista',
  'bird', 'animal', 'wildlife', 'pet', 'insect', 'fish', 'mammal',
  'plant', 'flower', 'tree', 'vegetation'
];

/**
 * Map likelihood values to readable strings
 */
function mapLikelihood(likelihood: any): string {
  const likelihoodStr = String(likelihood || 'UNKNOWN');
  const mapping: Record<string, string> = {
    'UNKNOWN': 'Unknown',
    'VERY_UNLIKELY': 'Very Unlikely',
    'UNLIKELY': 'Unlikely',
    'POSSIBLE': 'Possible',
    'LIKELY': 'Likely',
    'VERY_LIKELY': 'Very Likely'
  };
  return mapping[likelihoodStr] || 'Unknown';
}

/**
 * Categorize labels into objects and scenes with confidence scores
 * The first high-confidence label matching scene keywords goes to Scene Type
 */
function categorizeLabels(labelAnnotations: any[]): { objects: LabelWithScore[], scenes: LabelWithScore[], labels: LabelWithScore[] } {
  const objects: LabelWithScore[] = [];
  const scenes: LabelWithScore[] = [];
  const labels: LabelWithScore[] = [];
  let primarySceneFound = false;

  labelAnnotations.forEach((annotation, index) => {
    const label = annotation.description || '';
    const score = annotation.score || 0;
    const lowerLabel = label.toLowerCase();
    
    const labelWithScore: LabelWithScore = {
      description: label,
      score: Math.round(score * 1000) / 10 // Convert to percentage with 1 decimal
    };

    // Store all labels
    labels.push(labelWithScore);

    // First high-confidence scene keyword becomes the Scene Type
    if (!primarySceneFound && SCENE_KEYWORDS.some(keyword => lowerLabel.includes(keyword)) && score > 0.8) {
      scenes.push(labelWithScore);
      primarySceneFound = true;
    } else {
      objects.push(labelWithScore);
    }
  });

  return { objects, scenes, labels };
}

/**
 * Process a single image: read file, extract metadata, run Google Vision labeling
 */
export async function processImage(fileName: string): Promise<ImageRecord> {
  const filePath = path.join("storage", fileName);
  const record: ImageRecord = {
    imageId: fileName.split(".")[0],
    filename: fileName,
    originalName: "", // Will be set by upload.ts
    status: "processing"
  };

  try {
    // --- Extract Metadata ---
    const stats = fs.statSync(filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const dimensions = sizeOf(fileBuffer);

    const metadata: ImageMeta = {
      size: stats.size,
      width: dimensions.width || 0,
      height: dimensions.height || 0
    };
    record.metadata = metadata;

    // --- Google Vision API - Multiple detections ---
    const uint8Array = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);
    
    const [result] = await client.annotateImage({
      image: { content: uint8Array },
      features: [
        { type: 'LABEL_DETECTION' },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'SAFE_SEARCH_DETECTION' }
      ]
    });

    // Extract and categorize labels with confidence scores
    const labelAnnotations = result.labelAnnotations || [];
    const categorized = categorizeLabels(labelAnnotations);

    // Extract dominant colors
    const dominantColors: DominantColor[] = [];
    if (result.imagePropertiesAnnotation?.dominantColors?.colors) {
      result.imagePropertiesAnnotation.dominantColors.colors.forEach((colorInfo: any) => {
        if (colorInfo.color) {
          dominantColors.push({
            color: {
              red: colorInfo.color.red || 0,
              green: colorInfo.color.green || 0,
              blue: colorInfo.color.blue || 0
            },
            score: colorInfo.score || 0,
            pixelFraction: colorInfo.pixelFraction || 0
          });
        }
      });
    }

    // Extract safe search annotations
    let safeSearch: SafeSearchAnnotation | undefined;
    if (result.safeSearchAnnotation) {
      safeSearch = {
        adult: mapLikelihood(result.safeSearchAnnotation.adult),
        spoof: mapLikelihood(result.safeSearchAnnotation.spoof),
        medical: mapLikelihood(result.safeSearchAnnotation.medical),
        violence: mapLikelihood(result.safeSearchAnnotation.violence),
        racy: mapLikelihood(result.safeSearchAnnotation.racy)
      };
    }

    record.labels = {
      objects: categorized.objects,
      scenes: categorized.scenes,
      labels: categorized.labels,
      dominantColors: dominantColors.slice(0, 10), // Top 10 colors
      safeSearch
    };

    record.status = "done";
  } catch (err) {
    console.error("Error processing image", err);
    record.status = "error";
    record.labels = { objects: [], scenes: [], labels: [] };
  }

  return record;
}

/**
 * Process multiple images asynchronously
 */
export async function processJob(fileNames: string[]): Promise<ImageRecord[]> {
  return Promise.all(fileNames.map(f => processImage(f)));
}
