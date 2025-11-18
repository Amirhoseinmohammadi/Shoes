import crypto from "crypto";

function parseInitData(initData: string) {
  const params = new URLSearchParams(initData);
  const data: Record<string, any> = {};

  for (const [key, value] of params.entries()) {
    try {
      data[key] = JSON.parse(value);
    } catch {
      data[key] = value;
    }
  }

  return data;
}

export function verifyTelegramInitData(initData: string, botToken: string) {
  const data = parseInitData(initData);

  const receivedHash = data.hash;
  if (!receivedHash || !data.auth_date) {
    return { ok: false, user: null, error: "Missing hash/auth_date" };
  }

  const dataCopy: Record<string, any> = { ...data };
  delete dataCopy.hash;

  const dataCheckString = Object.keys(dataCopy)
    .sort()
    .map(
      (key) =>
        `${key}=${typeof dataCopy[key] === "object" ? JSON.stringify(dataCopy[key]) : dataCopy[key]}`,
    )
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash !== receivedHash) {
    return { ok: false, user: null, error: "Invalid hash" };
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - parseInt(data.auth_date) > 86400) {
    return { ok: false, user: null, error: "Expired" };
  }

  const rawUser =
    typeof data.user === "string" ? JSON.parse(data.user) : data.user;

  if (!rawUser || !rawUser.id) {
    return { ok: false, user: null, error: "User data missing" };
  }

  const user = {
    id: rawUser.id,
    username: rawUser.username || null,
    first_name: rawUser.first_name || "",
    last_name: rawUser.last_name || "",
    is_premium: rawUser.is_premium || false,
  };

  return { ok: true, user };
}
