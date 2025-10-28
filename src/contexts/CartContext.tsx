"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";

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
  clearCart: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// Helper functions
const getLocalCartKey = () => `guest-cart`;
const loadLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(getLocalCartKey());
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getLocalCartKey(), JSON.stringify(items));
  } catch (error) {
    console.error("❌ خطا در ذخیره سبد خرید:", error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  // Computed values
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Initialize cart when session changes
  useEffect(() => {
    const initializeCart = async () => {
      if (status === "loading") return;

      if (isAuthenticated) {
        await loadServerCart();
      } else {
        setCartItems(loadLocalCart());
      }
    };

    initializeCart();
  }, [status, isAuthenticated]);

  // Save to localStorage when cart changes (guest only)
  useEffect(() => {
    if (!isAuthenticated) {
      saveLocalCart(cartItems);
    }
  }, [cartItems, isAuthenticated]);

  // Simple helper: always send cookies with fetch
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      // keep headers that caller passed, don't overwrite Content-Type blindly
      headers: {
        ...(options.headers || {}),
      },
      credentials: "include", // <- MOST IMPORTANT: send cookies
    });
  };

  // Load cart from server
  const loadServerCart = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/cart", { method: "GET" });

      if (res.ok) {
        const apiData = await res.json();
        const formattedItems: CartItem[] = apiData.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.product?.name || "محصول",
          brand: item.product?.brand || "نامشخص",
          price: item.product?.price || 0,
          image:
            item.product?.image ||
            item.product?.variants?.[0]?.images?.[0]?.url ||
            "/default-image.jpg",
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        }));
        setCartItems(formattedItems);
      } else if (res.status === 401) {
        console.log("کاربر احراز هویت نشده - استفاده از سبد خرید محلی");
        setCartItems(loadLocalCart());
      } else {
        console.error("خطای سرور هنگام بارگذاری سبد:", res.status);
        setCartItems(loadLocalCart());
      }
    } catch (err) {
      console.error("❌ خطا در بارگذاری سبد خرید:", err);
      setCartItems(loadLocalCart());
    } finally {
      setLoading(false);
    }
  };

  const addItemToLocalCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.color === newItem.color &&
          item.size === newItem.size,
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += newItem.quantity;
        return updated;
      }

      return [...prev, newItem];
    });
  };

  const addItem = async ({
    shoe,
    quantity,
    color,
    size,
  }: AddItemParams): Promise<boolean> => {
    const temporaryId = Date.now();
    const newItem: CartItem = {
      id: temporaryId,
      productId: shoe.id,
      name: shoe.name,
      brand: shoe.brand,
      price: shoe.price,
      image: shoe.image,
      quantity,
      color,
      size,
    };

    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: shoe.id, quantity, color, size }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "خطا در افزودن به سبد");
        }

        const serverItem = await res.json();

        setCartItems((prev) => {
          const existingIndex = prev.findIndex(
            (item) =>
              item.productId === shoe.id &&
              item.color === color &&
              item.size === size,
          );

          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              id: serverItem.id,
              quantity: serverItem.quantity,
              name: serverItem.product?.name || updated[existingIndex].name,
              brand: serverItem.product?.brand || updated[existingIndex].brand,
              price: serverItem.product?.price || updated[existingIndex].price,
            };
            return updated;
          }

          return [
            ...prev,
            {
              ...newItem,
              id: serverItem.id,
              name: serverItem.product?.name || newItem.name,
              brand: serverItem.product?.brand || newItem.brand,
              price: serverItem.product?.price || newItem.price,
            },
          ];
        });

        return true;
      } catch (err) {
        console.error("❌ خطا در افزودن به سبد (server):", err);
        // fallback to local
        addItemToLocalCart(newItem);
        return true;
      } finally {
        setLoading(false);
      }
    } else {
      // guest
      addItemToLocalCart(newItem);
      return true;
    }
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/cart?id=${cartItemId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "خطا در حذف محصول");
        }

        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        return true;
      } catch (err) {
        console.error("❌ خطا در حذف محصول:", err);
        // fallback local removal
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        return true;
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      return true;
    }
  };

  const updateItemQuantity = async (
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> => {
    if (quantity <= 0) {
      return removeItem(cartItemId);
    }

    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, quantity }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || "خطا در بروزرسانی تعداد");
        }

        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item,
          ),
        );
        return true;
      } catch (err) {
        console.error("❌ خطا در بروزرسانی تعداد:", err);
        // fallback local update
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item,
          ),
        );
        return true;
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      );
      return true;
    }
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (!isAuthenticated) localStorage.removeItem(getLocalCartKey());
  }, [isAuthenticated]);

  const checkout = async (customer: {
    name: string;
    phone: string;
  }): Promise<boolean> => {
    if (cartItems.length === 0) {
      console.error("❌ سبد خرید خالی است");
      return false;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            color: i.color,
            size: i.size,
            price: i.price,
          })),
          customerName: customer.name,
          customerPhone: customer.phone,
          totalPrice,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "خطا در ثبت سفارش");
      }

      clearCart();
      return true;
    } catch (err) {
      console.error("❌ خطا در ثبت سفارش:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addItem,
        removeItem,
        updateItemQuantity,
        checkout,
        clearCart,
        loading,
        isAuthenticated,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
