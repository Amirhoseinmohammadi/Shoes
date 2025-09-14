interface ShoeVariant {
  color: string;
  images: string[];
  sizes: { size: number; stock: number }[];
}

interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  variants: ShoeVariant[];
}

const shoesData: Shoe[] = [
  {
    id: 1,
    name: "کفش ورزشی بچه گانه",
    brand: "لاگوست",
    price: 3700000,
    variants: [
      {
        color: "سفید",
        images: [
          "/images/products/shoe1-white-1.png",
          "/images/products/shoe1-white-2.png",
        ],
        sizes: [
          { size: 31, stock: 5 },
          { size: 32, stock: 4 },
          { size: 33, stock: 3 },
          { size: 34, stock: 2 },
          { size: 35, stock: 6 },
        ],
      },
      {
        color: "مشکی",
        images: [
          "/images/products/shoe1-black-1.png",
          "/images/products/shoe1-black-2.png",
        ],
        sizes: [
          { size: 31, stock: 2 },
          { size: 32, stock: 5 },
          { size: 33, stock: 3 },
          { size: 34, stock: 4 },
          { size: 35, stock: 1 },
        ],
      },
      {
        color: "آبی",
        images: [
          "/images/products/shoe1-blue-1.png",
          "/images/products/shoe1-blue-2.png",
        ],
        sizes: [
          { size: 31, stock: 3 },
          { size: 32, stock: 2 },
          { size: 33, stock: 4 },
          { size: 34, stock: 1 },
          { size: 35, stock: 5 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "دو خط",
    brand: "پاندا",
    price: 3700000,
    variants: [
      {
        color: "سفید",
        images: ["/images/products/doKhat-white-1.png"],
        sizes: [
          { size: 32, stock: 4 },
          { size: 33, stock: 3 },
          { size: 34, stock: 5 },
          { size: 35, stock: 2 },
          { size: 36, stock: 6 },
        ],
      },
      {
        color: "سبز",
        images: ["/images/products/doKhat-green-1.png"],
        sizes: [
          { size: 32, stock: 2 },
          { size: 33, stock: 4 },
          { size: 34, stock: 3 },
          { size: 35, stock: 5 },
          { size: 36, stock: 1 },
        ],
      },
      {
        color: "طوسی",
        images: ["/images/products/doKhat-gray-1.png"],
        sizes: [
          { size: 32, stock: 3 },
          { size: 33, stock: 2 },
          { size: 34, stock: 4 },
          { size: 35, stock: 6 },
          { size: 36, stock: 3 },
        ],
      },
      {
        color: "مشکی",
        images: ["/images/products/doKhat-black-1.png"],
        sizes: [
          { size: 32, stock: 5 },
          { size: 33, stock: 4 },
          { size: 34, stock: 2 },
          { size: 35, stock: 3 },
          { size: 36, stock: 2 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "جردن",
    brand: "پاموک",
    price: 4000000,
    variants: [
      {
        color: "آبی",
        images: ["/images/products/shoe3-blue-1.png"],
        sizes: [
          { size: 31, stock: 4 },
          { size: 32, stock: 3 },
          { size: 33, stock: 5 },
          { size: 34, stock: 2 },
          { size: 35, stock: 6 },
        ],
      },
      {
        color: "مشکی",
        images: ["/images/products/shoe3-black-1.png"],
        sizes: [
          { size: 31, stock: 2 },
          { size: 32, stock: 5 },
          { size: 33, stock: 3 },
          { size: 34, stock: 4 },
          { size: 35, stock: 1 },
        ],
      },
    ],
  },
  {
    id: 4,
    name: "باب داگ",
    brand: "Timberland",
    price: 3900000,
    variants: [
      {
        color: "قهوه‌ای",
        images: ["/images/products/bobDog-brown-1.png"],
        sizes: [
          { size: 32, stock: 5 },
          { size: 33, stock: 4 },
          { size: 34, stock: 3 },
          { size: 35, stock: 2 },
          { size: 36, stock: 6 },
        ],
      },
    ],
  },
  {
    id: 5,
    name: "کرومی",
    brand: "Nike",
    price: 4400000,
    variants: [
      {
        color: "قرمز",
        images: ["/images/products/shoe3-red-1.png"],
        sizes: [
          { size: 32, stock: 3 },
          { size: 33, stock: 2 },
          { size: 34, stock: 5 },
          { size: 35, stock: 6 },
          { size: 36, stock: 4 },
        ],
      },
      {
        color: "مشکی",
        images: ["/images/products/shoe3-black-2.png"],
        sizes: [
          { size: 32, stock: 4 },
          { size: 33, stock: 3 },
          { size: 34, stock: 2 },
          { size: 35, stock: 5 },
          { size: 36, stock: 1 },
        ],
      },
    ],
  },
  {
    id: 6,
    name: "سه قلب",
    brand: "Timberland",
    price: 4400000,
    variants: [
      {
        color: "قرمز",
        images: ["/images/products/seGhalb-red-1.png"],
        sizes: [
          { size: 32, stock: 2 },
          { size: 33, stock: 4 },
          { size: 34, stock: 3 },
          { size: 35, stock: 6 },
          { size: 36, stock: 5 },
        ],
      },
      {
        color: "مشکی",
        images: ["/images/products/seGhalb-black-1.png"],
        sizes: [
          { size: 32, stock: 3 },
          { size: 33, stock: 2 },
          { size: 34, stock: 5 },
          { size: 35, stock: 4 },
          { size: 36, stock: 6 },
        ],
      },
    ],
  },
];

export default shoesData;
