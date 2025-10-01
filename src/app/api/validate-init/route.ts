import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface InitData {
  auth_date: string;
  hash: string;
  user?: string;
  [key: string]: string;
}

const parseInitData = (initData: string): InitData => {
  const params = new URLSearchParams(initData);
  const data: InitData = {};
  for (const [key, value] of params) {
    data[key] = decodeURIComponent(value);
  }
  return data;
};

const validateInitData = (initData: string, botToken: string): boolean => {
  const data = parseInitData(initData);
  const receivedHash = data.hash;
  delete data.hash;

  const dataCheckString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", Buffer.from("WebAppData"))
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString, "utf8")
    .digest("hex");

  return receivedHash === calculatedHash;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { initData } = body as { initData: string };
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return NextResponse.json(
        { error: "Bot token not found" },
        { status: 500 },
      );
    }

    if (!initData) {
      return NextResponse.json({ error: "initData required" }, { status: 400 });
    }

    if (!validateInitData(initData, botToken)) {
      return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
    }

    const parsedData = parseInitData(initData);
    let user: TelegramUser;
    try {
      user = JSON.parse(parsedData.user || "{}");
    } catch {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    const authDate = parseInt(parsedData.auth_date || "0");
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return NextResponse.json({ error: "initData expired" }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      user,
    });
  } catch (error) {
    console.error("Validate error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
