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
        images: ["/images/products/lacoste/lacoste-sefid-meshki.png"],
        sizes: [
          { size: 31, stock: 5 },
          { size: 32, stock: 4 },
          { size: 33, stock: 3 },
          { size: 34, stock: 2 },
          { size: 35, stock: 6 },
        ],
      },
      {
        color: "کرم",
        images: ["/images/products/lacoste/lacoste-kerem.png"],
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
        images: ["/images/products/lacoste/lacoste-meshki.png"],
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
        images: ["/images/products/lacoste/lacoste-sefid-abi.png"],
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
        images: ["/images/products/doKhat/doKhat-sefid-meshki.png"],
        sizes: [
          { size: 32, stock: 4 },
          { size: 33, stock: 3 },
          { size: 34, stock: 5 },
          { size: 35, stock: 2 },
          { size: 36, stock: 6 },
        ],
      },
      {
        color: "کرم",
        images: ["/images/products/doKhat/doKhat-sefid-kerem.png"],
        sizes: [
          { size: 32, stock: 2 },
          { size: 33, stock: 4 },
          { size: 34, stock: 3 },
          { size: 35, stock: 5 },
          { size: 36, stock: 1 },
        ],
      },
      {
        color: "مشکی-کرم",
        images: ["/images/products/doKhat/doKhat-meshki-kerem.png"],
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
        images: ["/images/products/doKhat/doKhat-meshki-sefid.png"],
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
        color: "کرم",
        images: ["/images/products/jordan/jordan-kerem.png"],
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
        images: ["/images/products/jordan/jordan-sefid-meshki.png"],
        sizes: [
          { size: 31, stock: 2 },
          { size: 32, stock: 5 },
          { size: 33, stock: 3 },
          { size: 34, stock: 4 },
          { size: 35, stock: 1 },
        ],
      },
      {
        color: "طوسی",
        images: ["/images/products/jordan/jordan-tosi.png"],
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
        color: "مشکی",
        images: ["/images/products/bobDog/bobDog-black.png"],
        sizes: [
          { size: 32, stock: 5 },
          { size: 33, stock: 4 },
          { size: 34, stock: 3 },
          { size: 35, stock: 2 },
          { size: 36, stock: 6 },
        ],
      },
      {
        color: "آبی",
        images: ["/images/products/bobDog/bobDog-blue.png"],
        sizes: [
          { size: 32, stock: 5 },
          { size: 33, stock: 4 },
          { size: 34, stock: 3 },
          { size: 35, stock: 2 },
          { size: 36, stock: 6 },
        ],
      },
      {
        color: "صورتی",
        images: ["/images/products/bobDog/bobDog-pink.png"],
        sizes: [
          { size: 32, stock: 5 },
          { size: 33, stock: 4 },
          { size: 34, stock: 3 },
          { size: 35, stock: 2 },
          { size: 36, stock: 6 },
        ],
      },
      {
        color: "طوسی",
        images: ["/images/products/bobDog/bobDog-tosi.png"],
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
        color: "صورتی",
        images: ["/images/products/koromy/koromy-pink.png"],
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
        color: "بنفش",
        images: ["/images/products/3ghalb/3ghalb-banafsh.png"],
        sizes: [
          { size: 32, stock: 2 },
          { size: 33, stock: 4 },
          { size: 34, stock: 3 },
          { size: 35, stock: 6 },
          { size: 36, stock: 5 },
        ],
      },
      {
        color: "صورتی",
        images: ["/images/products/3ghalb/3ghalb-pink.png"],
        sizes: [
          { size: 32, stock: 3 },
          { size: 33, stock: 2 },
          { size: 34, stock: 5 },
          { size: 35, stock: 4 },
          { size: 36, stock: 6 },
        ],
      },
      {
        color: "کرم",
        images: ["/images/products/3ghalb/3ghalb-keremi.png"],
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
