import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, table, data, userId } = body;

    if (!action || !table) {
      return NextResponse.json(
        { error: "Action and table are required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "insert":
        result = await supabase
          .from(table)
          .insert([{ ...data, user_id: userId }])
          .select();
        break;

      case "select":
        result = await supabase
          .from(table)
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100);
        break;

      case "update":
        result = await supabase
          .from(table)
          .update(data)
          .eq("id", data.id)
          .eq("user_id", userId)
          .select();
        break;

      case "delete":
        result = await supabase
          .from(table)
          .delete()
          .eq("id", data.id)
          .eq("user_id", userId);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error: any) {
    console.error("Supabase API error:", error);
    return NextResponse.json(
      { error: error.message || "Database operation failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const userId = searchParams.get("userId");

    if (!table || !userId) {
      return NextResponse.json(
        { error: "Table and userId are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Supabase API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}