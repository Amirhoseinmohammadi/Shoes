"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: number;
  name: string;
  brand: string;
  color: string;
  size: number; // سایز تکی
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => boolean;
  removeItem: (id: number, color: string, size: number) => void;
  updateItemQuantity: (
    id: number,
    quantity: number,
    color: string,
    size: number,
  ) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItem = (
    item: Omit<CartItem, "quantity">,
    quantity: number,
  ): boolean => {
    let added = false;
    setCartItems((prev) => {
      const exists = prev.find(
        (i) =>
          i.id === item.id && i.color === item.color && i.size === item.size,
      );

      if (exists) {
        // اگر قبلا بود، تعدادش رو زیاد کن
        added = true;
        return prev.map((i) =>
          i.id === item.id && i.color === item.color && i.size === item.size
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      } else {
        // اگر نبود، اضافه کن
        added = true;
        return [...prev, { ...item, quantity }];
      }
    });
    return added;
  };

  const removeItem = (id: number, color: string, size: number) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && item.color === color && item.size === size),
      ),
    );
  };

  const updateItemQuantity = (
    id: number,
    quantity: number,
    color: string,
    size: number,
  ) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.color === color && item.size === size
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addItem, removeItem, updateItemQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};
