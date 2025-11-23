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
  } = useAuth();
  const { showToast } = useToast();
  const mountedRef = useRef(true);
  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      console.log("⏳ Waiting for auth...", { authLoading, isAuthenticated });
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
        if (err.name === "AbortError") {
          console.log("↪️ Cart fetch cancelled");
        } else {
          console.error("❌ Fetch cart error:", err);
        }
        if (mountedRef.current) {
          setCartItems([]);
        }
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
  }, [isAuthenticated, authLoading]);

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
      if (!telegramUser?.id) {
        showToast({
          type: "warning",
          message: "لطفا ابتدا وارد شوید",
          duration: 3000,
        });
        return false;
      }

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
        console.error("❌ Add item error:", err);
        showToast({
          type: "error",
          message: "خطا در اتصال",
          duration: 3000,
        });
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [telegramUser?.id, showToast],
  );

  const removeItem = useCallback(
    async (cartItemId: number): Promise<boolean> => {
      if (!telegramUser?.id) return false;

      setLoading(true);
      try {
        const res = await fetch(
          `/api/cart?id=${encodeURIComponent(String(cartItemId))}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

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
        console.error("❌ Remove item error:", err);
        showToast({
          type: "error",
          message: "خطا در اتصال",
          duration: 3000,
        });
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [telegramUser?.id, showToast],
  );

  const updateItemQuantity = useCallback(
    async (cartItemId: number, quantity: number): Promise<boolean> => {
      if (!telegramUser?.id) return false;

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
        console.error("❌ Update quantity error:", err);
        showToast({
          type: "error",
          message: "خطا در اتصال",
          duration: 3000,
        });
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [telegramUser?.id, removeItem, showToast],
  );

  const clearCart = useCallback(async (): Promise<void> => {
    if (!telegramUser?.id) {
      if (mountedRef.current) {
        setCartItems([]);
      }
      return;
    }

    try {
      await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });

      if (mountedRef.current) {
        setCartItems([]);
      }
    } catch (err) {
      console.error("❌ Clear cart error:", err);
    }
  }, [telegramUser?.id]);

  const checkout = useCallback(
    async (customer: { name: string; phone: string }): Promise<boolean> => {
      if (!telegramUser?.id) {
        showToast({
          type: "warning",
          message: "لطفا وارد شوید",
          duration: 3000,
        });
        return false;
      }

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

        showToast({
          type: "success",
          message: `سفارش ثبت شد - کد: ${data.trackingCode}`,
          duration: 4000,
        });

        return true;
      } catch (err) {
        console.error("❌ Checkout error:", err);
        showToast({
          type: "error",
          message: "خطا در ثبت سفارش",
          duration: 3000,
        });
        return false;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [telegramUser?.id, cartItems, clearCart, showToast],
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
