// src/app/api/validate-init/route.ts – رفع type error
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// نوع initData از Telegram docs (required fields رو optional کردم تا init {} کار کنه)
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface InitData {
  auth_date?: string; // optional برای parsing
  hash?: string; // optional برای parsing
  user?: string; // JSON string
  [key: string]: string | undefined;
}

// parse initData به object (حالا {} validه)
const parseInitData = (initData: string): InitData => {
  const params = new URLSearchParams(initData);
  const data: InitData = {};
  for (const [key, value] of params) {
    data[key] = decodeURIComponent(value); // decode برای JSON
  }
  return data;
};

// validate hash (چک می‌کنه فیلدها وجود داشته باشن)
const validateInitData = (initData: string, botToken: string): boolean => {
  const data = parseInitData(initData);
  const receivedHash = data.hash;
  if (!receivedHash || !data.auth_date) {
    return false; // فیلدهای لازم نباشن، invalid
  }

  delete data.hash; // hash رو حذف

  // data-check-string: keys sort و \n join (فقط فیلدهای non-empty)
  const dataCheckString = Object.keys(data)
    .filter((key) => data[key] !== undefined) // فیلدهای خالی رو ignore
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  // secret key
  const secretKey = crypto
    .createHmac("sha256", Buffer.from("WebAppData"))
    .update(botToken)
    .digest();

  // calculated hash
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

    // validate
    if (!validateInitData(initData, botToken)) {
      return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
    }

    // parse user
    const parsedData = parseInitData(initData);
    let user: TelegramUser;
    try {
      user = JSON.parse(parsedData.user || "{}");
    } catch {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    // auth_date expire check (24h)
    const authDate = parseInt(parsedData.auth_date || "0");
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return NextResponse.json({ error: "initData expired" }, { status: 401 });
    }

    // موفقیت: user رو برگردون
    return NextResponse.json({
      valid: true,
      user,
    });
  } catch (error) {
    console.error("Validate error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
