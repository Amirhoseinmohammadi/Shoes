// src/types/product.ts
// ─── Product & Variant Types ─────────────────────────────────────────────────

export interface VariantImage {
  id: number;
  url: string;
  variantId: number;
}

export interface ProductSize {
  id: number;
  size: string;
  stock: number;
  variantId: number;
}

export interface ProductVariant {
  id: number;
  color: string;
  productId: number;
  images: VariantImage[];
  sizes: ProductSize[];
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  description?: string | null;
  image?: string | null;
  category?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

/** نسخه‌ی خلاصه برای لیست محصولات */
export type ProductSummary = Pick<
  Product,
  "id" | "name" | "brand" | "price" | "image" | "category" | "isActive"
> & {
  variants: Pick<ProductVariant, "id" | "color" | "images" | "sizes">[];
};

/** ورودی ساخت/ویرایش محصول در admin */
export interface ProductInput {
  name: string;
  brand: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  isActive?: boolean;
}
