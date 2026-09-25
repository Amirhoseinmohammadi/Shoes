// src/types/auth.ts
// ─── Auth & Session Types ────────────────────────────────────────────────────

/** کاربر تلگرام — دقیقاً همانی که Telegram WebApp برمی‌گرداند */
export interface TelegramWebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

/** کاربر تأیید‌شده در سیستم ما (بعد از validate-init) */
export interface AuthUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  isAdmin: boolean;
}

/** Payload ذخیره‌شده در JWT session */
export interface SessionPayload {
  userId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/** نتیجه‌ی API /api/validate-init */
export interface ValidateInitResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}
