"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

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
  const [userId, setUserId] = useState<number | null>(null);
  const isAuthenticated = !!userId;

  // Computed values
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Get user ID from session
  const getUserId = useCallback(async (): Promise<number | null> => {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user?.id || null;
    } catch {
      return null;
    }
  }, []);

  // Initialize cart
  useEffect(() => {
    const initializeCart = async () => {
      const user = await getUserId();

      if (user) {
        setUserId(user);
        // Load from server for authenticated users
        await loadServerCart(user);
      } else {
        // Load from localStorage for guests
        const localCart = loadLocalCart();
        setCartItems(localCart);
      }
    };

    initializeCart();
  }, [getUserId]);

  // Save to localStorage when cart changes (guest only)
  useEffect(() => {
    if (!isAuthenticated) {
      saveLocalCart(cartItems);
    }
  }, [cartItems, isAuthenticated]);

  // Load cart from server
  const loadServerCart = async (userId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?userId=${userId}`);
      if (res.ok) {
        const apiData = await res.json();

        const formattedItems: CartItem[] = apiData.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.product?.name || "محصول",
          brand: item.product?.brand || "نامشخص",
          price: item.product?.price || 0,
          image: item.product?.image || "/default-image.jpg",
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        }));

        setCartItems(formattedItems);
      }
    } catch (err) {
      console.error("❌ خطا در بارگذاری سبد خرید:", err);
      // Fallback to local storage
      const localCart = loadLocalCart();
      setCartItems(localCart);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addItem = async ({
    shoe,
    quantity,
    color,
    size,
  }: AddItemParams): Promise<boolean> => {
    const temporaryId = Date.now();

    // Create new item
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

    // For authenticated users - sync with server
    if (isAuthenticated && userId) {
      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            productId: shoe.id,
            quantity,
            color,
            size,
          }),
        });

        if (!res.ok) throw new Error("خطا در افزودن به سبد");

        const serverItem = await res.json();

        // Update with server data
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
            };
            return updated;
          }

          return [...prev, { ...newItem, id: serverItem.id }];
        });

        return true;
      } catch (err) {
        console.error("❌ خطا در افزودن به سبد:", err);
        // Fallback to local
        addItemToLocalCart(newItem);
        return true;
      } finally {
        setLoading(false);
      }
    } else {
      // Guest - local only
      addItemToLocalCart(newItem);
      return true;
    }
  };

  // Helper for local cart operations
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

  // Remove item from cart
  const removeItem = async (cartItemId: number): Promise<boolean> => {
    if (isAuthenticated && userId) {
      setLoading(true);
      try {
        const res = await fetch(`/api/cart/${cartItemId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("خطا در حذف محصول");

        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        return true;
      } catch (err) {
        console.error("❌ خطا در حذف محصول:", err);
        // Fallback to local
        setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
        return true;
      } finally {
        setLoading(false);
      }
    } else {
      // Guest
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
      return true;
    }
  };

  // Update item quantity
  const updateItemQuantity = async (
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> => {
    if (quantity <= 0) {
      return removeItem(cartItemId);
    }

    if (isAuthenticated && userId) {
      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, quantity }),
        });

        if (!res.ok) throw new Error("خطا در بروزرسانی تعداد");

        setCartItems((prev) =>
          prev.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item,
          ),
        );
        return true;
      } catch (err) {
        console.error("❌ خطا در بروزرسانی تعداد:", err);
        // Fallback to local
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
      // Guest
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      );
      return true;
    }
  };

  // Clear cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    if (!isAuthenticated) {
      localStorage.removeItem(getLocalCartKey());
    }
  }, [isAuthenticated]);

  // Checkout
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
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          color: item.color,
          size: item.size,
        })),
        customerName: customer.name,
        customerPhone: customer.phone,
        ...(isAuthenticated && userId && { userId }),
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "خطا در ثبت سفارش");
      }

      // Clear cart after successful order
      clearCart();

      // Clear server cart if authenticated
      if (isAuthenticated && userId) {
        await fetch("/api/cart/clear", { method: "POST" });
      }

      return true;
    } catch (err) {
      console.error("❌ خطا در ثبت سفارش:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value: CartContextType = {
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
