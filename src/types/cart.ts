// src/types/cart.ts
// ─── Cart Types ───────────────────────────────────────────────────────────────

/** آیتم داخل سبد خرید (normalized برای UI) */
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
}

/** ورودی اضافه کردن به سبد */
export interface AddToCartInput {
  productId: number;
  quantity?: number;
  color?: string;
  sizeId?: number;
}

/** ورودی checkout */
export interface CheckoutInput {
  name: string;
  phone: string;
}
