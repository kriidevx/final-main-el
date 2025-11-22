import { NextRequest, NextResponse } from "next/server";

const MURF_AI_API_KEY = process.env.MURF_AI_API_KEY || "";
const MURF_AI_API_URL = "https://api.murf.ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voice_id = "Matthew", model = "FALCON", multiNativeLocale = "en-US" } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!MURF_AI_API_KEY) {
      console.error("Murf AI API key not configured in environment variables");
      return NextResponse.json(
        { error: "Murf AI API key not configured" },
        { status: 500 }
      );
    }

    // Log the request for debugging
    console.log("Murf AI Stream TTS Request:", {
      text: text.substring(0, 50) + "...",
      voice_id,
      model,
      multiNativeLocale
    });

    // Use the Stream Speech endpoint
    const response = await fetch(`${MURF_AI_API_URL}/v1/speech/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": MURF_AI_API_KEY,  // Use api-key header
      },
      body: JSON.stringify({
        "text": text,
        "voiceId": voice_id,
        "model": model,
        "multiNativeLocale": multiNativeLocale
      }),
    });

    // Log response status for debugging
    console.log("Murf AI API Response Status:", response.status);
    
    if (!response.ok) {
      // Try to parse error as JSON first
      try {
        const errorText = await response.text();
        const errorJson = JSON.parse(errorText);
        console.error("Murf AI API Error:", errorJson);
        return NextResponse.json(
          { 
            error: `TTS conversion failed: ${response.status} ${response.statusText}`,
            details: errorJson.errorMessage || errorText
          },
          { status: response.status }
        );
      } catch (parseError) {
        // If not JSON, return as text
        const errorText = await response.text();
        console.error("Murf AI API Error (text):", errorText);
        return NextResponse.json(
          { 
            error: `TTS conversion failed: ${response.status} ${response.statusText}`,
            details: errorText
          },
          { status: response.status }
        );
      }
    }

    // Check content type to determine if it's audio or JSON
    const contentType = response.headers.get("content-type");
    console.log("Content-Type:", contentType);
    
    // If it's an audio file, return it directly
    if (contentType && (contentType.includes("audio") || contentType.includes("application/octet-stream"))) {
      const audioBuffer = await response.arrayBuffer();
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.byteLength.toString(),
        },
      });
    }
    
    // Otherwise, try to parse as JSON
    const data = await response.json();
    console.log("Murf AI Response:", data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("TTS API error:", error);
    return NextResponse.json(
      { 
        error: "Text-to-speech conversion failed",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!MURF_AI_API_KEY) {
      console.error("Murf AI API key not configured in environment variables");
      return NextResponse.json(
        { error: "Murf AI API key not configured" },
        { status: 500 }
      );
    }

    // Return a default list of voices since the API endpoint is not working
    const defaultVoices = {
      voices: [
        {
          voice_id: "Matthew",
          name: "Matthew",
          category: "premade",
          labels: {
            language: "English",
            accent: "American",
            gender: "Male"
          }
        },
        {
          voice_id: "Amy",
          name: "Amy",
          category: "premade",
          labels: {
            language: "English",
            accent: "British",
            gender: "Female"
          }
        },
        {
          voice_id: "Joanna",
          name: "Joanna",
          category: "premade",
          labels: {
            language: "English",
            accent: "American",
            gender: "Female"
          }
        }
      ]
    };

    return NextResponse.json(defaultVoices);
  } catch (error: any) {
    console.error("Get voices error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch voices",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
}