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
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

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
  const { user: telegramUser } = useTelegram();
  useEffect(() => {
    if (telegramUser?.id) {
      setUserId(telegramUser.id);
      console.log("✅ UserID from Telegram:", telegramUser.id);
    }
  }, [telegramUser?.id]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  useEffect(() => {
    setCartItems(loadLocalCart());
  }, []);

  useEffect(() => {
    saveLocalCart(cartItems);
  }, [cartItems]);

  const addItem = async ({
    shoe,
    quantity,
    color,
    size,
  }: AddItemParams): Promise<boolean> => {
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
          i.productId === newItem.productId
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, newItem];
    });

    return true;
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
    return true;
  };

  const updateItemQuantity = async (
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> => {
    if (quantity <= 0) return removeItem(cartItemId);
    setCartItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity } : i)),
    );
    return true;
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
      console.error("❌ سبد خرید خالی است");
      return false;
    }

    if (!userId) {
      console.error("❌ userId نامشخص است");
      return false;
    }

    if (!customer.name?.trim() || !customer.phone?.trim()) {
      console.error("❌ نام و شماره تماس الزامی است");
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

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || "خطا در ثبت سفارش");
      }

      clearCart();
      return true;
    } catch (e: any) {
      console.error("❌ Checkout error:", e.message);
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
