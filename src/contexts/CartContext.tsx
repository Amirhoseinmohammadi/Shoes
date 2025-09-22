"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// -- INTERFACES --

// رابط آیتم سبد خرید کامل‌تر شده است
export interface CartItem {
  id: number; // همیشه شناسه یکتای آیتم سبد خرید (cartItemId) است
  productId: number; // شناسه محصول برای شناسایی unqiue
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
  color?: string; // پشتیبانی از رنگ
  // size?: string; // پشتیبانی از سایز
}

export interface Shoe {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
}

// رابط برای پارامترهای تابع addItem برای خوانایی بهتر
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
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // -- DATA FETCHING --

  useEffect(() => {
    const loadCartFromAPI = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart?userId=1");
        if (res.ok) {
          const apiData = await res.json();
          // ✅ FIX: Map all required fields from the API response
          const formattedItems: CartItem[] = apiData.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity,
            color: item.color,
          }));
          setCartItems(formattedItems);
        }
      } catch (err) {
        console.error("❌ خطا در بارگذاری سبد:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCartFromAPI();
  }, []);

  const addItem = async ({
    shoe,
    quantity,
    color,
    size,
  }: AddItemParams): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          productId: shoe.id,
          quantity,
          color,
          size,
        }),
      });
      if (!res.ok) throw new Error("خطا در افزودن به سبد");

      const addedOrUpdatedItem = await res.json();

      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.id === addedOrUpdatedItem.id,
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: addedOrUpdatedItem.quantity,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: addedOrUpdatedItem.id,
              productId: addedOrUpdatedItem.productId,
              name: addedOrUpdatedItem.product.name,
              brand: addedOrUpdatedItem.product.brand,
              price: addedOrUpdatedItem.product.price,
              image: addedOrUpdatedItem.product.image,
              quantity: addedOrUpdatedItem.quantity,
              color: addedOrUpdatedItem.color,
              size: addedOrUpdatedItem.size,
            },
          ];
        }
      });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?id=${cartItemId}&userId=1`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("خطا در حذف محصول");
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> => {
    // ✅ FIX: Removed the faulty "quantity < 10" check
    if (!cartItemId) return false;

    // If quantity is 0 or less, treat it as a remove action
    if (quantity <= 0) {
      return removeItem(cartItemId);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity, userId: 1 }),
      });
      if (!res.ok) throw new Error("خطا در بروزرسانی تعداد");

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      );
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
      value={{ cartItems, addItem, removeItem, updateItemQuantity, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};
