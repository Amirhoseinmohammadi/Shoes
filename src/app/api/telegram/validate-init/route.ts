import { NextResponse } from "next/server"
import crypto from "crypto"

function parseQS(qs: string) {
  const params = new URLSearchParams(qs)
  const result: Record<string, string> = {}
  for (const [k, v] of params.entries()) result[k] = v
  return result
}

export async function POST(req: Request) {
  const { initData } = await req.json()
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ""
  if (!BOT_TOKEN) return NextResponse.json({ valid: false, reason: "BOT_TOKEN missing" })

  const params = parseQS(initData)
  const hash = params.hash
  if (!hash) return NextResponse.json({ valid: false, reason: "no hash" })
  delete params.hash

  const dataCheckString = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join("\n")

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest()
  const computed = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

  if (computed !== hash) return NextResponse.json({ valid: false, reason: "hash mismatch" })

  return NextResponse.json({
    valid: true,
    payload: {
      user: JSON.parse(params.user || "{}"),
      auth_date: params.auth_date,
    },
  })
}
