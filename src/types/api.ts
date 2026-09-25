// src/types/api.ts
// ─── API Response Wrappers ────────────────────────────────────────────────────

/** Response موفق از API */
export interface ApiSuccess<T> {
  success: true;
  data?: T;
  message?: string;
}

/** Response خطا از API */
export interface ApiError {
  success: false;
  error: string;
}

/** Union type برای همه‌ی API response ها */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Re-export همه type های دیگر برای import راحت‌تر ──────────────────────────
export type { TelegramWebAppUser, AuthUser, SessionPayload, ValidateInitResponse } from "./auth";
export type { Product, ProductSummary, ProductInput, ProductVariant, ProductSize, VariantImage } from "./product";
export type {
  Order,
  OrderItem,
  OrderStatus,
  CreateOrderInput,
  UpdateOrderStatusInput,
} from "./order";
export { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "./order";
export type { CartItem, AddToCartInput, CheckoutInput } from "./cart";
