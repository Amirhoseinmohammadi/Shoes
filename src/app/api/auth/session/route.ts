import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    console.log("📨 GET /api/auth/session");

    const session = await getSession();

    if (!session) {
      console.warn("⚠️ No session found");
      return NextResponse.json(
        { error: "No active session", success: false },
        { status: 401 },
      );
    }

    console.log("✅ Session found for user:", session.userId);

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        first_name: session.firstName,
        last_name: session.lastName,
        username: session.username,
        isAdmin: session.isAdmin,
      },
    });
  } catch (error) {
    console.error("❌ GET /api/auth/session error:", error);
    return NextResponse.json(
      { error: "Failed to get session", success: false },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No session", success: false },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        first_name: session.firstName,
        last_name: session.lastName,
        username: session.username,
        isAdmin: session.isAdmin,
      },
    });
  } catch (error) {
    console.error("❌ POST /api/auth/session error:", error);
    return NextResponse.json(
      { error: "Failed to refresh session", success: false },
      { status: 500 },
    );
  }
}
