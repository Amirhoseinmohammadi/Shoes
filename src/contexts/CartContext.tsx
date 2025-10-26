"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
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
  loading: boolean;
  isAuthenticated: boolean;
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
  const [userId, setUserId] = useState<number | null>(null);

  // محاسبه isAuthenticated بر اساس وجود userId (بدون نیاز به status جداگانه)
  const isAuthenticated = !!userId;

  const getUserId = async (): Promise<number | null> => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user?.id || null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      setCartItems([]);
      return;
    }

    const loadCartFromAPI = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cart?userId=${userId}`);
        if (res.ok) {
          const apiData = await res.json();

          const formattedItems: CartItem[] = apiData.map((item: any) => {
            const variant = item.product.variants?.find(
              (v: any) => v.color === item.color,
            );

            const image =
              variant?.images?.length > 0 ? variant.images[0].url : null;

            return {
              id: item.id,
              productId: item.productId,
              name: item.product.name,
              brand: item.product.brand,
              price: item.product.price,
              image: image || item.product.image,
              quantity: item.quantity,
              color: item.color,
              size: item.size,
            };
          });

          setCartItems(formattedItems);
        } else if (res.status === 401) {
          console.log("کاربر احراز هویت نشده");
          setCartItems([]);
        }
      } catch (err) {
        console.error("❌ خطا در بارگذاری سبد:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCartFromAPI();
  }, [userId, isAuthenticated]); // وابستگی به userId و isAuthenticated (که از userId derive می‌شه)

  const addItem = async ({
    shoe,
    quantity,
    color,
    size,
  }: AddItemParams): Promise<boolean> => {
    if (!isAuthenticated || !userId) {
      console.error("❌ کاربر لاگین نیست");
      return false;
    }

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
          image: shoe.image,
          size,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "خطا در افزودن به سبد");
      }

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
            image:
              addedOrUpdatedItem.product?.image ||
              addedOrUpdatedItem.image ||
              updated[existingIndex].image,
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
              image:
                addedOrUpdatedItem.product.image ||
                addedOrUpdatedItem.image ||
                shoe.image,
              quantity: addedOrUpdatedItem.quantity,
              color: addedOrUpdatedItem.color,
              size: addedOrUpdatedItem.size,
            },
          ];
        }
      });
      return true;
    } catch (err) {
      console.error("❌ خطا در افزودن به سبد:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    if (!isAuthenticated || !userId) {
      console.error("❌ کاربر لاگین نیست");
      return false;
    }

    // ✅ بررسی وجود cartItemId
    if (!cartItemId || isNaN(cartItemId)) {
      console.error("❌ شناسه نامعتبر:", cartItemId);
      return false;
    }

    setLoading(true);
    try {
      console.log("🗑️ حذف آیتم:", cartItemId);

      // ✅ ارسال درخواست با query parameter صحیح
      const res = await fetch(`/api/cart?id=${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ خطای سرور:", errorData);
        throw new Error(errorData.error || "خطا در حذف محصول");
      }

      const result = await res.json();
      console.log("✅ نتیجه حذف:", result);

      // ✅ به‌روزرسانی state
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
      return true;
    } catch (err: any) {
      console.error("❌ خطا در حذف محصول:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> => {
    if (!cartItemId) return false;

    if (!isAuthenticated || !userId) {
      console.error("❌ کاربر لاگین نیست");
      return false;
    }

    if (quantity <= 0) {
      return removeItem(cartItemId);
    }

    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItemId,
          quantity,
          userId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "خطا در بروزرسانی تعداد");
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      );
      return true;
    } catch (err) {
      console.error("❌ خطا در بروزرسانی تعداد:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkout = async (customer: {
    name: string;
    phone: string;
  }): Promise<boolean> => {
    if (!isAuthenticated || !userId) {
      console.error("❌ کاربر لاگین نیست");
      return false;
    }

    if (cartItems.length === 0) {
      console.error("❌ سبد خرید خالی است");
      return false;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            size: item.size,
          })),
          customerName: customer.name,
          customerPhone: customer.phone,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "خطا در ثبت سفارش");
      }

      const clearRes = await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (clearRes.ok) {
        setCartItems([]);
      }

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
        loading,
        isAuthenticated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
