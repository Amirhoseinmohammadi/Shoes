"use client";
import { useTelegram } from "@/hooks/useTelegram";
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
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    // ✅ Return default safe values instead of throwing
    console.warn("⚠️ useCart called outside CartProvider");
    return {
      cartItems: [],
      addItem: async () => false,
      removeItem: async () => false,
      updateItemQuantity: async () => false,
      checkout: async () => false,
      clearCart: () => {},
      loading: false,
      totalItems: 0,
      totalPrice: 0,
    };
  }
  return context;
};

const getLocalCartKey = () => `guest-cart`;

const loadLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(getLocalCartKey());
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("❌ Error loading cart from localStorage:", error);
    return [];
  }
};

const saveLocalCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getLocalCartKey(), JSON.stringify(items));
  } catch (error) {
    console.error("❌ Error saving cart to localStorage:", error);
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const { user: telegramUser } = useTelegram();

  // ✅ Initialize cart from localStorage
  useEffect(() => {
    try {
      const savedCart = loadLocalCart();
      setCartItems(savedCart);
    } catch (error) {
      console.error("❌ Cart initialization error:", error);
      setCartItems([]);
    } finally {
      setInitialized(true);
    }
  }, []);

  // ✅ Update userId when telegram user changes
  useEffect(() => {
    if (telegramUser?.id) {
      setUserId(telegramUser.id);
      console.log("✅ Cart userId set:", telegramUser.id);
    }
  }, [telegramUser?.id]);

  // ✅ Save cart whenever it changes
  useEffect(() => {
    if (initialized) {
      saveLocalCart(cartItems);
    }
  }, [cartItems, initialized]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  const addItem = async ({
    shoe,
    quantity,
    color,
    size,
  }: AddItemParams): Promise<boolean> => {
    try {
      const newItem: CartItem = {
        id: Date.now(),
        productId: shoe.id,
        name: shoe.name,
        brand: shoe.brand,
        price: shoe.price,
        image: shoe.image,
        quantity,
        color,
        size,
      };

      setCartItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.productId === newItem.productId &&
            i.color === newItem.color &&
            i.size === newItem.size,
        );

        if (existing) {
          return prev.map((i) =>
            i.productId === newItem.productId && i.color === newItem.color
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }

        return [...prev, newItem];
      });

      return true;
    } catch (error) {
      console.error("❌ Error adding item:", error);
      return false;
    }
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    try {
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
      return true;
    } catch (error) {
      console.error("❌ Error removing item:", error);
      return false;
    }
  };

  const updateItemQuantity = async (
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> => {
    try {
      if (quantity <= 0) return removeItem(cartItemId);

      setCartItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)),
      );

      return true;
    } catch (error) {
      console.error("❌ Error updating quantity:", error);
      return false;
    }
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(getLocalCartKey());
  }, []);

  const checkout = async (customer: {
    name: string;
    phone: string;
  }): Promise<boolean> => {
    if (cartItems.length === 0) {
      console.error("❌ Cart is empty");
      return false;
    }

    if (!userId) {
      console.error("❌ userId is not set - user not logged in");
      return false;
    }

    if (!customer.name?.trim() || !customer.phone?.trim()) {
      console.error("❌ Name and phone are required");
      return false;
    }

    // ✅ Prevent double submissions
    if (loading) {
      console.warn("⏳ Checkout already in progress");
      return false;
    }

    setLoading(true);
    try {
      const orderData = {
        userId,
        items: cartItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          color: i.color || null,
          size: i.size || null,
          price: i.price,
        })),
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        totalPrice,
        telegramData:
          typeof window !== "undefined"
            ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user
            : null,
      };

      console.log("📤 Submitting order...", orderData);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const responseData = await res.json();
      console.log("📥 Order response:", responseData);

      if (!res.ok) {
        throw new Error(responseData.message || "خطا در ثبت سفارش");
      }

      clearCart();
      return true;
    } catch (error: any) {
      console.error("❌ Checkout error:", error.message);
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
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
