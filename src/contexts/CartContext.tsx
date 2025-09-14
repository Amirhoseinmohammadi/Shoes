"use client";

import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { Shoe } from "@/types/shoe";

interface CartItem extends Shoe {
  quantity: number;
  size?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (item: Shoe, quantity?: number, size?: string) => void;
  removeItem: (id: number, size?: string) => void;
  updateItemQuantity: (id: number, quantity: number, size?: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  }, []);

  // ذخیره در LocalStorage هر بار که تغییر کرد
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (
    item: Shoe,
    quantity: number = 1,
    size?: string,
    color?: string,
  ) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (p) => p.id === item.id && p.size === size && p.color === color,
      );

      if (existing) {
        return prev.map((p) =>
          p.id === item.id && p.size === size && p.color === color
            ? { ...p, quantity: p.quantity + quantity }
            : p,
        );
      }

      return [...prev, { ...item, quantity, size, color }];
    });
  };

  const removeItem = (id: string, size?: string, color?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(item.id === id && item.size === size && item.color === color),
      ),
    );
  };

  const updateItemQuantity = (
    id: number,
    quantity: number,
    size?: string,
    color?: string,
  ) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => setCartItems([]);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
