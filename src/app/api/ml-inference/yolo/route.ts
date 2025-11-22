import { NextRequest, NextResponse } from "next/server";

const YOLO_API_URL = process.env.YOLO_API_URL || "http://localhost:5001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, confidence = 0.75 } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${YOLO_API_URL}/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        image, 
        confidence_threshold: confidence 
      }),
    });

    if (!response.ok) {
      throw new Error("YOLO detection failed");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      detections: data.detections || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("YOLO API error:", error);
    return NextResponse.json(
      { error: "Object detection failed" },
      { status: 500 }
    );
  }
}