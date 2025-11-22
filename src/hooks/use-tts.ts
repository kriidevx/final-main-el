"use client";

import { useState } from "react";

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: {
    language?: string;
    accent?: string;
    description?: string;
    age?: string;
    gender?: string;
  };
}

export interface TTSOptions {
  text: string;
  voiceId: string;
  model?: string;
  multiNativeLocale?: string;
}

export function useTTS() {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const getVoices = async (): Promise<Voice[]> => {
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch voices");
      }

      const data = await response.json();
      const fetchedVoices = data.voices || [];
      
      setVoices(fetchedVoices);
      return fetchedVoices;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch voices";
      setError(errorMessage);
      console.error("Get voices error:", err);
      throw err;
    }
  };

  const convertTextToSpeech = async (
    text: string,
    options?: {
      voiceId?: string;
      model?: string;
      multiNativeLocale?: string;
    }
  ) => {
    setIsConverting(true);
    setError(null);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      // Call the Murf AI API through our Next.js API route
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice_id: options?.voiceId || "Matthew",
          model: options?.model || "FALCON",
          multiNativeLocale: options?.multiNativeLocale || "en-US",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to convert text to speech";
        const errorDetails = errorData.details ? `: ${errorData.details}` : "";
        throw new Error(`${errorMessage}${errorDetails}`);
      }

      // Get the audio blob from the response
      const audioBlob = await response.blob();
      setAudioBlob(audioBlob);
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);

      // Play the audio
      const audio = new Audio(audioUrl);
      audio.play();

      // Clean up the object URL after playing
      audio.addEventListener("ended", () => {
        URL.revokeObjectURL(audioUrl);
      });

      return { success: true, audioUrl, audioBlob };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("TTS conversion error:", err);
      throw err;
    } finally {
      setIsConverting(false);
    }
  };

  const downloadAudio = (blob: Blob, filename: string = 'speech.mp3') => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    convertTextToSpeech,
    getVoices,
    downloadAudio,
    isConverting,
    error,
    voices,
    audioBlob,
    audioUrl,
  };
}