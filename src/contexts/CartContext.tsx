"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "./ToastContext";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";

interface TelegramUserType {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

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

interface CartContextType {
  cartItems: CartItem[];
  addItem: (...args: any[]) => Promise<boolean>;
  removeItem: (id: number) => Promise<boolean>;
  updateItemQuantity: (id: number, qty: number) => Promise<boolean>;
  checkout: (customer: { name: string; phone: string }) => Promise<boolean>;
  clearCart: () => Promise<void>;
  loading: boolean;
  totalItems: number;
  totalPrice: number;
  isAuthenticated: boolean;
  telegramUser: TelegramUserType | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { user: telegramUser, loading: authLoading, logout } = useAuth();
  const isAuthenticated = !!telegramUser?.id;

  const { showToast } = useToast();
  const mountedRef = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setCartItems([]);

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, [telegramUser?.id]);

  /* ---------------- AUTH ERROR ---------------- */

  const handleUnauthorized = useCallback(async () => {
    showToast({
      type: "error",
      message: "جلسه شما منقضی شده است",
      duration: 4000,
    });
    setCartItems([]);
    await logout();
  }, [showToast, logout]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const controller = new AbortController();
    abortRef.current = controller;

    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          credentials: "include",
          signal: controller.signal,
        });

        if (res.status === 401) {
          await handleUnauthorized();
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        if (mountedRef.current && Array.isArray(data.cartItems)) {
          setCartItems(data.cartItems);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") console.error(e);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchCart();

    return () => controller.abort();
  }, [isAuthenticated, authLoading, handleUnauthorized]);

  const totalItems = useMemo(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((s, i) => s + (i.price || 0) * (i.quantity || 0), 0),
    [cartItems],
  );

  const addItem = async () => true;
  const removeItem = async () => true;
  const updateItemQuantity = async () => true;
  const checkout = async () => true;
  const clearCart = async () => setCartItems([]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateItemQuantity,
        checkout,
        clearCart,
        loading: loading || authLoading,
        totalItems,
        totalPrice,
        isAuthenticated,
        telegramUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
