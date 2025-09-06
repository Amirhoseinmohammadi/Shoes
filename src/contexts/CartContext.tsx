"use client";
import { createContext, useState, useContext, ReactNode } from "react";
import { Shoe } from "@/types/shoe";

interface CartContextType {
  cartItems: Shoe[];
  addItem: (item: Shoe) => void;
  removeItem: (item: Shoe) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<Shoe[]>([]);

  const addItem = (item: Shoe) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  const removeItem = (item: Shoe) => {
    setCartItems((prevItems) =>
      prevItems.filter((cartItem) => cartItem.id !== item.id),
    );
  };

  const value = {
    cartItems,
    addItem,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
