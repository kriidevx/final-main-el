"use client";

import type { BoundingBox } from "../../types";

const YOLO_API_URL = process.env.NEXT_PUBLIC_YOLO_API_URL || "http://localhost:5001";

export async function detectObjects(imageData: string): Promise<BoundingBox[]> {
  try {
    const response = await fetch(`${YOLO_API_URL}/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      throw new Error("Detection failed");
    }

    const data = await response.json();
    return data.detections || [];
  } catch (error) {
    console.error("YOLO detection error:", error);
    return [];
  }
}

export async function detectObjectsFromVideo(
  videoElement: HTMLVideoElement
): Promise<BoundingBox[]> {
  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.drawImage(videoElement, 0, 0);
  const imageData = canvas.toDataURL("image/jpeg", 0.8);

  return detectObjects(imageData);
}