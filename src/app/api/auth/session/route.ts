import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();

    if (!session || typeof session.userId !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "No active session",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        first_name: session.firstName ?? null,
        last_name: session.lastName ?? null,
        username: session.username ?? null,
        isAdmin: session.isAdmin ?? false,
      },
    });
  } catch (error) {
    console.error("❌ GET /api/auth/session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to read session",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
    },
    { status: 405 },
  );
}
