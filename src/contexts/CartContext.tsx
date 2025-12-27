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

/* ================= TYPES ================= */

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

/* ================= CONTEXT ================= */

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};

/* ================= PROVIDER ================= */

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { user: telegramUser, loading: authLoading, logout } = useAuth();
  const isAuthenticated = !!telegramUser?.id;
  const { showToast } = useToast();

  const mountedRef = useRef(true);

  /* -------- AUTH ERROR -------- */

  const handleUnauthorized = useCallback(async () => {
    showToast({
      type: "error",
      message: "جلسه شما منقضی شده است",
    });
    setCartItems([]);
    await logout();
  }, [logout, showToast]);

  /* -------- FETCH CART (NORMALIZED) -------- */

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;

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

      if (mountedRef.current && Array.isArray(data.cartItems)) {
        const normalized: CartItem[] = data.cartItems.map((item: any) => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          brand: item.product.brand,
          price: item.product.price,
          image: item.product.images?.[0]?.url || "/images/default-shoe.png",
          quantity: item.quantity,
          color: item.color,
          size: item.size?.label,
        }));

        setCartItems(normalized);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [isAuthenticated, handleUnauthorized]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /* ================= ACTIONS ================= */

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
          message: data.error || "خطا در افزودن محصول",
        });
        return false;
      }

      await fetchCart();

      showToast({ type: "success", message: "به سبد خرید اضافه شد" });
      return true;
    } catch {
      showToast({ type: "error", message: "خطای ارتباط با سرور" });
      return false;
    } finally {
      setLoading(false);
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
      showToast({ type: "success", message: "سفارش ثبت شد" });
      return true;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
  };

  /* ================= TOTALS ================= */

  const totalItems = useMemo(
    () => cartItems.reduce((s, i) => s + i.quantity, 0),
    [cartItems],
  );

  const totalPrice = useMemo(
    () => cartItems.reduce((s, i) => s + i.price * i.quantity, 0),
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
