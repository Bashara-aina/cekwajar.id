import { NextRequest, NextResponse } from "next/server";

const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;

interface TextAnnotation {
  description: string;
  boundingPoly?: {
    vertices?: { x?: number; y?: number }[];
  };
}

interface LandmarkAnnotation {
  description: string;
  boundingPoly: {
    vertices: { x: number; y: number }[];
  };
}

interface VisionResponse {
  textAnnotations?: TextAnnotation[];
  landmarkAnnotations?: LandmarkAnnotation[];
  fullTextAnnotation?: {
    text: string;
    pages?: Array<{
      width: number;
      height: number;
      blocks: unknown[];
    }>;
  };
  error?: { message: string; code: number };
}

function base64ToMimeType(base64: string): string {
  const firstChar = base64.charAt(0);
  if (firstChar === "/") return "image/jpeg";
  if (firstChar === "i") return "image/png";
  if (firstChar === "R") return "image/gif";
  return "image/jpeg";
}

export async function POST(request: NextRequest) {
  try {
    const { image_base64, mime_type } = await request.json();

    if (!image_base64) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 });
    }

    if (!GOOGLE_VISION_API_KEY) {
      return NextResponse.json(
        { error: "Google Vision API key not configured" },
        { status: 503 }
      );
    }

    const mime = mime_type || base64ToMimeType(image_base64);
    const imagePayload = `data:${mime};base64,${image_base64}`;
    const base64Data = imagePayload.split(",")[1];

    const visionRequest = {
      requests: [
        {
          image: { content: base64Data },
          features: [
            { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 },
            { type: "TEXT_DETECTION", maxResults: 10 },
            { type: "LANDMARK_DETECTION", maxResults: 5 },
          ],
        },
      ],
    };

    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visionRequest),
      }
    );

    if (!visionRes.ok) {
      const errText = await visionRes.text();
      console.error("Google Vision API error:", errText);
      return NextResponse.json(
        { error: "Vision API request failed", details: errText },
        { status: 502 }
      );
    }

    const data: VisionResponse = await visionRes.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message, code: data.error.code },
        { status: 502 }
      );
    }

    const rawText = data.fullTextAnnotation?.text ||
                    data.textAnnotations?.[0]?.description ||
                    "";

    const extracted = {
      raw_text: rawText,
      landmarks: data.landmarkAnnotations?.map((l) => l.description) || [],
      confidence: rawText.length > 50 ? 0.8 : rawText.length > 20 ? 0.6 : 0.3,
      lines: rawText.split("\n").filter((l) => l.trim().length > 0),
    };

    return NextResponse.json({
      success: true,
      data: extracted,
      provider: "google_vision",
    });
  } catch (err) {
    console.error("OCR error:", err);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}