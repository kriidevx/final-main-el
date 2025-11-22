"use client";

const MURF_AI_API_KEY = process.env.MURF_AI_API_KEY || "";

export interface TTSOptions {
  voiceId: string;
  text: string;
  model?: string;
  multiNativeLocale?: string;
}

export async function textToSpeech({
  voiceId,
  text,
  model = "FALCON",
  multiNativeLocale = "en-US",
}: TTSOptions): Promise<Blob> {
  try {
    const response = await fetch(`/api/text-to-speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voice_id: voiceId,
        text,
        model,
        multiNativeLocale,
      }),
    });

    if (!response.ok) {
      throw new Error("TTS conversion failed");
    }

    return await response.blob();
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
}

export async function getVoices() {
  try {
    const response = await fetch(`/api/text-to-speech`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch voices");
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error("Get voices error:", error);
    return [];
  }
}