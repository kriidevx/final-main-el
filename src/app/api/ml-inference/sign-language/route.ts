import { NextRequest, NextResponse } from "next/server";

const SIGN_LANGUAGE_API_URL = process.env.SIGN_LANGUAGE_API_URL || "http://localhost:5002";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, landmarks } = body;

    if (!image && !landmarks) {
      return NextResponse.json(
        { error: "Image or landmarks data is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${SIGN_LANGUAGE_API_URL}/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image, landmarks }),
    });

    if (!response.ok) {
      throw new Error("Sign language detection failed");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      detected_sign: data.sign || "Unknown",
      confidence: data.confidence || 0,
      hand_landmarks: data.landmarks || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sign language API error:", error);
    return NextResponse.json(
      { error: "Sign language detection failed" },
      { status: 500 }
    );
  }
}