// src/types/shoe.ts
export interface VariantImage {
  id: number;
  url: string;
  variantId: number;
}

export interface VariantSize {
  id: number;
  size: string;
  stock: number;
  variantId: number;
}

export interface ShoeVariant {
  id: number;
  color: string;
  images: VariantImage[];
  sizes: VariantSize[];
}

export interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  description?: string | null;
  image?: string | null;
  variants: ShoeVariant[];
}
