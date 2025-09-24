export interface Size {
  id: number;
  size: string;
  stock: number;
}

export interface VariantImage {
  id: number;
  url: string;
}

export interface ShoeVariant {
  id: number;
  color: string;
  images: VariantImage[];
  sizes: Size[];
}

export interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string | null;
  variants: ShoeVariant[];
}
