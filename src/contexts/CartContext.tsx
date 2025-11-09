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
  telegramUser: any | null;
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
      clearCart: () => {},
      loading: false,
      totalItems: 0,
      totalPrice: 0,
      telegramUser: null,
    };
  }
  return context;
};

const CART_KEY = "guest-cart";
const TELEGRAM_USER_KEY = "telegram-user";

const loadLocalCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {}
};

const loadLocalTelegramUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(TELEGRAM_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveLocalTelegramUser = (user: any) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TELEGRAM_USER_KEY, JSON.stringify(user));
  } catch {}
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(
    loadLocalTelegramUser(),
  );

  const { user: telegramUserFromHook } = useTelegram();

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = loadLocalCart();
    setCartItems(savedCart);
    setInitialized(true);
  }, []);

  // Save cart on change
  useEffect(() => {
    if (initialized) saveLocalCart(cartItems);
  }, [cartItems, initialized]);

  // Set telegram user only once and save to localStorage
  useEffect(() => {
    if (!telegramUser && telegramUserFromHook) {
      const userData = {
        id: Number(telegramUserFromHook.id),
        username: telegramUserFromHook.username,
        first_name: telegramUserFromHook.first_name,
        last_name: telegramUserFromHook.last_name,
        photo_url: telegramUserFromHook.photo_url,
      };
      setTelegramUser(userData);
      saveLocalTelegramUser(userData);
    }
  }, [telegramUserFromHook, telegramUser]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  const addItem = async ({ shoe, quantity, color, size }: AddItemParams) => {
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
            i.productId === newItem.productId &&
            i.color === newItem.color &&
            i.size === newItem.size
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          );
        }
        return [...prev, newItem];
      });
      return true;
    } catch {
      return false;
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
      return true;
    } catch {
      return false;
    }
  };

  const updateItemQuantity = async (cartItemId: number, quantity: number) => {
    if (quantity <= 0) return removeItem(cartItemId);
    try {
      setCartItems((prev) =>
        prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)),
      );
      return true;
    } catch {
      return false;
    }
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const checkout = async (customer: { name: string; phone: string }) => {
    if (!telegramUser) return false;
    if (cartItems.length === 0) return false;
    if (!customer.name?.trim() || !customer.phone?.trim()) return false;
    if (loading) return false;

    setLoading(true);
    try {
      const orderData = {
        userId: telegramUser.id,
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
        telegramData: telegramUser,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "خطا در ثبت سفارش");
      clearCart();
      return true;
    } catch {
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
        totalItems,
        totalPrice,
        telegramUser,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
