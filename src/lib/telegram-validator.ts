import crypto from "crypto";

export const validateInitData = (
  initData: string,
  botToken: string,
): boolean => {
  const parseInitData = (dataString: string) => {
    const params = new URLSearchParams(dataString);
    const data: Record<string, string | undefined> = {};
    for (const [key, value] of params) {
      data[key] = decodeURIComponent(value);
    }
    return data;
  };

  const data = parseInitData(initData);
  const receivedHash = data.hash;

  if (!receivedHash || !data.auth_date) {
    return false;
  }

  delete data.hash;

  const dataCheckString = Object.keys(data)
    .filter((key) => data[key] !== undefined)
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

  const isValid = receivedHash === calculatedHash;

  if (!isValid) {
    console.error("Telegram Data Validation Failed: Hash Mismatch.");
  }

  return isValid;
};

export const isInitDataExpired = (
  auth_date_str: string | undefined,
): boolean => {
  const authDate = parseInt(auth_date_str || "0");
  const now = Math.floor(Date.now() / 1000);
  const EXPIRATION_TIME = 86400; // 24 hours

  if (now - authDate > EXPIRATION_TIME) {
    console.error("Telegram Data Expired.");
    return true;
  }
  return false;
};
