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
  language_code?: string;
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

export interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
}

interface AddItemParams {
  shoe: Shoe;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (params: AddItemParams) => Promise<boolean>;
  removeItem: (cartItemId: number) => Promise<boolean>;
  updateItemQuantity: (
    cartItemId: number,
    quantity: number,
  ) => Promise<boolean>;
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
  const context = useContext(CartContext);
  if (!context) {
    console.warn("⚠️ useCart called outside CartProvider");
    return {
      cartItems: [],
      addItem: async () => false,
      removeItem: async () => false,
      updateItemQuantity: async () => false,
      checkout: async () => false,
      clearCart: async () => {},
      loading: false,
      totalItems: 0,
      totalPrice: 0,
      isAuthenticated: false,
      telegramUser: null,
    };
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const {
    user: telegramUser,
    loading: authLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  const { showToast } = useToast();
  const mountedRef = useRef(true);
  const fetchControllerRef = useRef<AbortController | null>(null);

  const handleUnauthorized = useCallback(async () => {
    showToast({
      type: "error",
      message: "جلسه شما منقضی شده است. لطفا دوباره وارد شوید.",
      duration: 5000,
    });
    if (mountedRef.current) {
      setCartItems([]);
    }
    await logout();
  }, [showToast, logout]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      console.log("👤 User not authenticated, skipping cart fetch.");
      setCartItems([]);
      setInitialized(true);
      return;
    }

    if (authLoading) {
      console.log("⏳ Waiting for auth to complete.");
      return;
    }

    if (!telegramUser?.id) {
      console.log("⏳ Authenticated but user ID not available yet.");
      return;
    }

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;

    const fetchCart = async () => {
      setLoading(true);
      try {
        console.log(
          "📦 Fetching cart for authenticated user:",
          telegramUser.id,
        );
        const res = await fetch("/api/cart", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        if (res.status === 401) {
          await handleUnauthorized();
          return;
        }

        if (!res.ok) {
          console.warn("⚠️ Failed to fetch cart:", res.status);
          if (mountedRef.current) {
            setCartItems([]);
            setInitialized(true);
          }
          return;
        }

        const data = await res.json();
        if (
          mountedRef.current &&
          data.success &&
          Array.isArray(data.cartItems)
        ) {
          console.log("✅ Cart loaded with", data.cartItems.length, "items");
          setCartItems(data.cartItems);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("❌ Cart fetch error:", err);
        }
      } finally {
        if (mountedRef.current) {
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    fetchCart();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, authLoading, handleUnauthorized, telegramUser?.id]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + (i.price || 0) * (i.quantity || 0),
    0,
  );

  const addItem = useCallback(
    async ({
      shoe,
      quantity,
      color,
      size,
    }: AddItemParams): Promise<boolean> => {
      if (quantity <= 0 || quantity > 100) {
        showToast({
          type: "error",
          message: "تعداد نامعتبر است (1-100)",
          duration: 3000,
        });
        return false;
      }

      if (!shoe?.id || shoe.id <= 0) {
        showToast({
          type: "error",
          message: "محصول نامعتبر است",
          duration: 3000,
        });
        return false;
      }

      setLoading(true);
      try {
        console.log("📝 Adding to cart:", {
          productId: shoe.id,
          quantity,
          color,
        });

        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: shoe.id,
            quantity,
            color: color || null,
            sizeId: null,
          }),
          credentials: "include",
        });

        if (res.status === 401) {
          await handleUnauthorized();
          return false;
        }

        const data = await res.json();
        console.log("Response:", {
          status: res.status,
          success: data.success,
          error: data.error,
        });

        if (!res.ok) {
          showToast({
            type: "error",
            message: data.error || "خطا در افزودن به سبد خرید",
            duration: 3000,
          });
          return false;
        }

        if (mountedRef.current && data.cartItem) {
          console.log("✅ Item added to cart");
          setCartItems((prev) => {
            const existing = prev.find(
              (i) =>
                i.productId === shoe.id && i.color === (color || undefined),
            );
            if (existing) {
              return prev.map((i) =>
                i.id === existing.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              );
            }
            return [...prev, data.cartItem];
          });
        }

        showToast({
          type: "success",
          message: `${shoe.name} اضافه شد ✅`,
          duration: 2000,
        });

        return true;
      } catch (err) {
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [showToast, handleUnauthorized],
  );

  const removeItem = useCallback(
    async (cartItemId: number): Promise<boolean> => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/cart?id=${encodeURIComponent(String(cartItemId))}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        if (res.status === 401) {
          await handleUnauthorized();
          return false;
        }

        const data = await res.json();

        if (!res.ok) {
          showToast({
            type: "error",
            message: data.error || "خطا در حذف",
            duration: 3000,
          });
          return false;
        }

        if (mountedRef.current) {
          setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
        }

        showToast({
          type: "success",
          message: "حذف شد",
          duration: 2000,
        });

        return true;
      } catch (err) {
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [showToast, handleUnauthorized],
  );

  const updateItemQuantity = useCallback(
    async (cartItemId: number, quantity: number): Promise<boolean> => {
      if (quantity <= 0) {
        return removeItem(cartItemId);
      }

      if (quantity > 100) {
        showToast({
          type: "error",
          message: "حداکثر تعداد 100 است",
          duration: 3000,
        });
        return false;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItemId,
            quantity,
          }),
          credentials: "include",
        });

        if (res.status === 401) {
          await handleUnauthorized();
          return false;
        }

        const data = await res.json();

        if (!res.ok) {
          showToast({
            type: "error",
            message: data.error || "خطا در بروزرسانی",
            duration: 3000,
          });
          return false;
        }

        if (mountedRef.current && data.cartItem) {
          setCartItems((prev) =>
            prev.map((i) =>
              i.id === cartItemId
                ? { ...i, quantity: data.cartItem.quantity }
                : i,
            ),
          );
        }

        return true;
      } catch (err) {
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [removeItem, showToast, handleUnauthorized],
  );

  const clearCart = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // برای اطمینان بیشتر اضافه شد
        credentials: "include",
      });

      // اگر سرور پاسخ 401 بدهد (خطای سشن)، باید لاگ اوت شود
      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      // 🔑 این چک حیاتی است: اگر پاسخ موفقیت‌آمیز بود (مثلاً 200)، استیت را خالی کن
      if (res.ok) {
        if (mountedRef.current) {
          setCartItems([]); // خالی کردن سبد خرید در فرانت‌اند
          console.log("✅ Cart state cleared successfully.");
        }
      } else {
        // اگر res.ok نبود (مثلاً 500 یا 400 از سرور)
        const errorData = await res.json();
        console.error(
          "❌ Failed to clear cart on server side:",
          errorData.error,
        );
        showToast({
          type: "error",
          message: errorData.error || "خطا در پاکسازی سبد خرید",
          duration: 3000,
        });
      }
    } catch (err) {
      console.error("❌ Network or fetch error during clearCart:", err);
      showToast({
        type: "error",
        message: "خطای شبکه در پاکسازی سبد خرید",
        duration: 3000,
      });
    }
  }, [handleUnauthorized, showToast]);

  const checkout = useCallback(
    async (customer: { name: string; phone: string }): Promise<boolean> => {
      if (cartItems.length === 0) {
        showToast({
          type: "warning",
          message: "سبد خرید خالی است",
          duration: 3000,
        });
        return false;
      }

      if (!customer.name?.trim() || !customer.phone?.trim()) {
        showToast({
          type: "error",
          message: "نام و تلفن الزامی است",
          duration: 3000,
        });
        return false;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cartItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              color: i.color || null,
              size: i.size || null,
            })),
            customerName: customer.name.trim(),
            customerPhone: customer.phone.trim(),
          }),
          credentials: "include",
        });

        if (res.status === 401) {
          await handleUnauthorized();
          return false;
        }

        const data = await res.json();

        if (!res.ok) {
          showToast({
            type: "error",
            message: data.error || "خطا در ثبت سفارش",
            duration: 3000,
          });
          return false;
        }

        console.log("🗑️ Clearing cart after successful order...");
        await clearCart();
        console.log("✅ Cart cleared successfully");

        showToast({
          type: "success",
          message: `سفارش ثبت شد - کد: ${data.trackingCode}`,
          duration: 4000,
        });

        return true;
      } catch (err) {
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [cartItems, clearCart, showToast, handleUnauthorized],
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      cartItems,
      addItem,
      removeItem,
      updateItemQuantity,
      checkout,
      clearCart,
      loading: loading || authLoading,
      totalItems,
      totalPrice,
      isAuthenticated: !!telegramUser?.id,
      telegramUser: telegramUser as TelegramUserType | null,
    }),
    [
      cartItems,
      addItem,
      removeItem,
      updateItemQuantity,
      checkout,
      clearCart,
      loading,
      authLoading,
      totalItems,
      totalPrice,
      telegramUser,
    ],
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
