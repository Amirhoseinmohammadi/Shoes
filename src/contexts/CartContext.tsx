"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  brand: string;
  color: string;
  size: number;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity: number,
  ) => Promise<boolean>;
  removeItem: (id: number, color: string, size: number) => Promise<void>;
  updateItemQuantity: (
    id: number,
    quantity: number,
    color: string,
    size: number,
  ) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // بارگذاری سبد از localStorage و API هنگام mount
  useEffect(() => {
    const loadCart = async () => {
      // ابتدا localStorage
      const storedCart = localStorage.getItem("cartItems");
      if (storedCart) setCartItems(JSON.parse(storedCart));

      // سپس GET از API
      try {
        const res = await fetch("/api/cart?userId=1");
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
        }
      } catch (err) {
        console.error("خطا در بارگذاری سبد:", err);
      }
    };

    loadCart();
  }, []);

  // ذخیره خودکار در localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = async (
    item: Omit<CartItem, "quantity">,
    quantity: number,
  ) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1, productId: item.id, quantity }),
      });

      if (!res.ok) throw new Error("خطا در افزودن به سبد خرید");

      const data = await res.json();

      setCartItems((prev) => {
        const exists = prev.find(
          (i) =>
            i.id === item.id && i.color === item.color && i.size === item.size,
        );

        if (exists) {
          return prev.map((i) =>
            i.id === item.id && i.color === item.color && i.size === item.size
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        } else {
          return [...prev, { ...item, quantity }];
        }
      });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const removeItem = async (id: number, color: string, size: number) => {
    try {
      await fetch(`/api/cart?id=${id}`, { method: "DELETE" });

      setCartItems((prev) =>
        prev.filter(
          (item) =>
            !(item.id === id && item.color === color && item.size === size),
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateItemQuantity = async (
    id: number,
    quantity: number,
    color: string,
    size: number,
  ) => {
    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      });

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id && item.color === color && item.size === size
            ? { ...item, quantity }
            : item,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addItem, removeItem, updateItemQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
};
