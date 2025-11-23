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

// ... (Interfaceها بدون تغییر) ...

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
  // ... (CartContextType بدون تغییر) ...
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

// ... (useCart بدون تغییر) ...

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

  // 💡 اضافه کردن logout از useAuth
  const {
    user: telegramUser,
    loading: authLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  const { showToast } = useToast();
  const mountedRef = useRef(true);
  const fetchControllerRef = useRef<AbortController | null>(null);

  // 💡 تابع مدیریت خطای 401 که در چندین جا استفاده خواهد شد
  const handleUnauthorized = useCallback(async () => {
    showToast({
      type: "error",
      message: "جلسه شما منقضی شده است. لطفا دوباره وارد شوید.",
      duration: 5000,
    });
    // پاک کردن وضعیت محلی سبد خرید
    if (mountedRef.current) {
      setCartItems([]);
    }
    // خروج از حساب برای پاک کردن کوکی در سمت سرور
    await logout();
  }, [showToast, logout]);

  useEffect(() => {
    // 💡 شرط fetchCart را با افزودن چک loading بهتر می‌کنیم
    if (!isAuthenticated && !authLoading) {
      // اگر احراز هویت تمام شده و کاربر لاگین نیست، هیچ کاری نکن
      console.log("👤 User not authenticated, skipping cart fetch.");
      setCartItems([]);
      setInitialized(true);
      return;
    }

    if (authLoading) {
      // در حال بارگذاری است، منتظر می‌مانیم
      console.log("⏳ Waiting for auth to complete.");
      return;
    }

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    const controller = new AbortController();
    fetchControllerRef.current = controller;

    const fetchCart = async () => {
      try {
        console.log("📦 Fetching cart for authenticated user");
        const res = await fetch("/api/cart", {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });

        // 💡 مدیریت خطای 401 در GET
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

        // ... (بقیه منطق موفقیت‌آمیز) ...

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
        // ... (مدیریت خطا) ...
      } finally {
        if (mountedRef.current) {
          setInitialized(true);
        }
      }
    };

    fetchCart();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, authLoading, handleUnauthorized]); // 💡 handleUnauthorized را به وابستگی‌ها اضافه کنید

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
      // ❌ حذف شرط if (!telegramUser?.id) که خطای "لطفا وارد شوید" را صادر می‌کرد

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

        // 💡 مدیریت خطای 401 در POST
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

        // ... (بقیه منطق موفقیت‌آمیز) ...

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
        // ... (مدیریت خطا) ...
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [showToast, handleUnauthorized], // 💡 وابستگی‌ها اصلاح شد
  );

  const removeItem = useCallback(
    async (cartItemId: number): Promise<boolean> => {
      // ❌ حذف شرط if (!telegramUser?.id)

      setLoading(true);
      try {
        const res = await fetch(
          `/api/cart?id=${encodeURIComponent(String(cartItemId))}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        // 💡 مدیریت خطای 401 در DELETE
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
        // ... (مدیریت خطا) ...
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [showToast, handleUnauthorized], // 💡 وابستگی‌ها اصلاح شد
  );

  const updateItemQuantity = useCallback(
    async (cartItemId: number, quantity: number): Promise<boolean> => {
      // ❌ حذف شرط if (!telegramUser?.id)

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

        // 💡 مدیریت خطای 401 در PATCH
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

        // ... (بقیه منطق موفقیت‌آمیز) ...

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
        // ... (مدیریت خطا) ...
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [removeItem, showToast, handleUnauthorized], // 💡 وابستگی‌ها اصلاح شد
  );

  const clearCart = useCallback(async (): Promise<void> => {
    // ❌ حذف شرط if (!telegramUser?.id)

    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });

      // 💡 مدیریت خطای 401 در clearCart (اختیاری اما توصیه می‌شود)
      if (res.status === 401) {
        await handleUnauthorized();
        return;
      }

      if (mountedRef.current) {
        setCartItems([]);
      }
    } catch (err) {
      console.error("❌ Clear cart error:", err);
    }
  }, [handleUnauthorized]); // 💡 وابستگی‌ها اصلاح شد

  const checkout = useCallback(
    async (customer: { name: string; phone: string }): Promise<boolean> => {
      // ❌ حذف شرط if (!telegramUser?.id)

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

        // 💡 مدیریت خطای 401 در checkout
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

        await clearCart();

        // ... (بقیه منطق موفقیت‌آمیز) ...

        showToast({
          type: "success",
          message: `سفارش ثبت شد - کد: ${data.trackingCode}`,
          duration: 4000,
        });

        return true;
      } catch (err) {
        // ... (مدیریت خطا) ...
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [cartItems, clearCart, showToast, handleUnauthorized], // 💡 وابستگی‌ها اصلاح شد
  );

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const contextValue = useMemo(
    // ... (contextValue بدون تغییر) ...
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
