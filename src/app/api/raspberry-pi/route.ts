import { NextRequest, NextResponse } from "next/server";

const RASPBERRY_PI_URL = process.env.RASPBERRY_PI_API_URL || "http://localhost:5000";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${RASPBERRY_PI_URL}/stream`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to connect to Raspberry Pi");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Raspberry Pi API error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Raspberry Pi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command } = body;

    const response = await fetch(`${RASPBERRY_PI_URL}/control`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    });

    if (!response.ok) {
      throw new Error("Failed to send command to Raspberry Pi");
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Raspberry Pi control error:", error);
    return NextResponse.json(
      { error: "Failed to control Raspberry Pi" },
      { status: 500 }
    );
  }
}