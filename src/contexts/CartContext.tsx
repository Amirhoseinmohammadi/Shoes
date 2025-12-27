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
  useMemo,
  useRef,
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
  addItem: (data: {
    productId: number;
    quantity?: number;
    color?: string;
    sizeId?: number;
  }) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<boolean>;
  updateItemQuantity: (cartItemId: number, qty: number) => Promise<boolean>;
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
  const isAuthenticated = Boolean(telegramUser?.id);
  const { showToast } = useToast();

  const mountedRef = useRef(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
    }
  }, [isAuthenticated]);

  const handleUnauthorized = useCallback(async () => {
    showToast({
      type: "error",
      message: "جلسه شما منقضی شده است",
    });
    setCartItems([]);
    await logout();
  }, [logout, showToast]);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !mountedRef.current) return;

    try {
      setLoading(true);

      const res = await fetch("/api/cart", {
        credentials: "include",
      });

      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (!res.ok) return;

      const data = await res.json();

      if (!Array.isArray(data.cartItems)) return;

      const normalized: CartItem[] = data.cartItems.map((item: any) => {
        const product = item.product || {};

        return {
          id: item.id,
          productId: product.id ?? item.productId,
          name: product.name ?? "محصول",
          brand: product.brand ?? "",
          price: Number(product.price ?? 0),
          image:
            product.images?.[0]?.url ||
            product.variants?.[0]?.images?.[0]?.url ||
            "/images/default-shoe.png",
          quantity: Number(item.quantity ?? 1),
          color: item.color ?? undefined,
          size: item.size?.label ?? item.size?.size ?? undefined,
        };
      });

      if (mountedRef.current) {
        setCartItems(normalized);
      }
    } catch (err) {
      console.error("fetchCart error:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated, handleUnauthorized]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async ({
    productId,
    quantity = 1,
    color,
    sizeId,
  }: {
    productId: number;
    quantity?: number;
    color?: string;
    sizeId?: number;
  }) => {
    try {
      setLoading(true);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity, color, sizeId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showToast({
          type: "error",
          message: data?.error || "خطا در افزودن محصول",
        });
        return false;
      }

      await fetchCart();

      showToast({
        type: "success",
        message: "به سبد خرید اضافه شد",
      });

      return true;
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        message: "خطای ارتباط با سرور",
      });
      return false;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const updateItemQuantity = async (cartItemId: number, qty: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cartItemId, quantity: qty }),
      });

      const data = await res.json();
      if (!data.success) return false;

      await fetchCart();
      return true;
    } catch {
      return false;
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!data.success) return false;

      await fetchCart();
      return true;
    } catch {
      return false;
    }
  };

  const checkout = async (customer: { name: string; phone: string }) => {
    try {
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(customer),
      });

      const data = await res.json();
      if (!data.success) return false;

      await fetchCart();

      showToast({
        type: "success",
        message: "سفارش ثبت شد",
      });

      return true;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
  };

  const totalItems = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity, 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [cartItems],
  );

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
