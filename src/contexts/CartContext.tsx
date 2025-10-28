"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useSession, getSession } from "next-auth/react";

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

  // Load cart from server with JWT
  const loadServerCart = async () => {
    setLoading(true);
    try {
      const token = session?.user ? (await getSession())?.user?.id : null;

      const res = await fetch("/api/cart", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // اضافه کردن JWT
        },
      });

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
      }
    } catch (err) {
      console.error("❌ خطا در بارگذاری سبد خرید:", err);
      setCartItems(loadLocalCart());
    } finally {
      setLoading(false);
    }
  };

  // Helper to send JWT in fetch
  const fetchWithAuth = async (url: string, options: any = {}) => {
    const token = session?.user ? (await getSession())?.user?.id : null;
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
  };

  // Add, remove, update, checkout - استفاده از fetchWithAuth
  const addItem = async ({ shoe, quantity, color, size }: AddItemParams) => {
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
          body: JSON.stringify({ productId: shoe.id, quantity, color, size }),
        });

        if (!res.ok) throw new Error("خطا در افزودن به سبد");

        const serverItem = await res.json();
        setCartItems((prev) => [...prev, { ...newItem, id: serverItem.id }]);
        return true;
      } catch (err) {
        console.error(err);
        addItemToLocalCart(newItem);
        return true;
      } finally {
        setLoading(false);
      }
    } else {
      addItemToLocalCart(newItem);
      return true;
    }
  };

  const addItemToLocalCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const index = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.color === newItem.color &&
          item.size === newItem.size,
      );
      if (index >= 0) {
        prev[index].quantity += newItem.quantity;
        return [...prev];
      }
      return [...prev, newItem];
    });
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await fetch(`/api/cart?id=${cartItemId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("خطا در حذف محصول");

        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        return true; // ← حتما boolean برگردان
      } catch (err) {
        console.error("❌ خطا در حذف محصول:", err);
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        return true; // ← fallback هم boolean برگردون
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      return true; // ← guest هم boolean برگردونه
    }
  };

  const updateItemQuantity = async (
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> => {
    if (quantity <= 0) return removeItem(cartItemId); // removeItem هم باید Promise<boolean> بده

    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await fetchWithAuth("/api/cart", {
          method: "PATCH",
          body: JSON.stringify({ cartItemId, quantity }),
        });
        if (!res.ok) throw new Error("خطا در بروزرسانی تعداد");

        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item,
          ),
        );

        return true; // ← اضافه شد
      } catch (err) {
        console.error(err);
        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item,
          ),
        );
        return true; // ← fallback هم boolean بده
      } finally {
        setLoading(false);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      );
      return true; // ← برای guest
    }
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (!isAuthenticated) localStorage.removeItem(getLocalCartKey());
  }, [isAuthenticated]);

  const checkout = async (customer: { name: string; phone: string }) => {
    if (cartItems.length === 0) return false;
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cartItems,
          customerName: customer.name,
          customerPhone: customer.phone,
          totalPrice,
        }),
      });
      if (!res.ok) throw new Error("خطا در ثبت سفارش");
      clearCart();
      return true;
    } catch (err) {
      console.error(err);
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
