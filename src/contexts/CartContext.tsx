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
  const isAuthenticated = !!userId;

  // Helper برای localStorage (guest cart)
  const getLocalCartKey = () => `guest-cart-${Date.now()}`; // unique key برای session
  const loadLocalCart = (): CartItem[] => {
    try {
      const key = getLocalCartKey();
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };
  const saveLocalCart = (items: CartItem[]) => {
    try {
      const key = getLocalCartKey();
      localStorage.setItem(key, JSON.stringify(items));
    } catch {}
  };

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
    // اول local cart رو لود کن (برای guest)
    const localCart = loadLocalCart();
    if (localCart.length > 0) {
      setCartItems(localCart);
    }

    // بعد userId رو چک کن (async)
    getUserId().then((id) => {
      if (id) {
        setUserId(id);
        // Merge guest cart به server cart (اگر لازم)
        if (localCart.length > 0) {
          // TODO: Sync to server via API call (e.g., addItem batch)
          console.log("🔄 Merging guest cart to server...");
          // مثال: localCart.forEach(item => addItem({...item}));
        }
      }
    });
  }, []);

  // Save to local if guest
  useEffect(() => {
    if (!isAuthenticated) {
      saveLocalCart(cartItems);
    }
  }, [cartItems, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      // فقط local رو نگه دار
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
          setCartItems(loadLocalCart()); // fallback to local
        }
      } catch (err) {
        console.error("❌ خطا در بارگذاری سبد:", err);
        setCartItems(loadLocalCart()); // fallback
      } finally {
        setLoading(false);
      }
    };

    loadCartFromAPI();
  }, [userId]);

  const addItem = async ({
    shoe,
    quantity,
    color,
    size,
  }: AddItemParams): Promise<boolean> => {
    const newItem: CartItem = {
      id: Date.now(), // temporary ID for guest
      productId: shoe.id,
      name: shoe.name,
      brand: shoe.brand,
      price: shoe.price,
      image: shoe.image,
      quantity,
      color,
      size,
    };

    if (isAuthenticated && userId) {
      // Server cart
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
        // Update with server ID
        newItem.id = addedOrUpdatedItem.id;
        newItem.name = addedOrUpdatedItem.product.name;
        newItem.brand = addedOrUpdatedItem.product.brand;
        newItem.price = addedOrUpdatedItem.product.price;
        newItem.image = addedOrUpdatedItem.product.image || shoe.image;

        setCartItems((prev) => {
          const existingIndex = prev.findIndex(
            (i) => i.productId === shoe.id && i.color === color,
          );
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: addedOrUpdatedItem.quantity,
            };
            return updated;
          }
          return [...prev, newItem];
        });
        return true;
      } catch (err) {
        console.error("❌ خطا در افزودن به سبد:", err);
        // Fallback to local
        setCartItems((prev) => [...prev, newItem]);
        return true;
      } finally {
        setLoading(false);
      }
    } else {
      // Guest: فقط local
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.productId === shoe.id && i.color === color,
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }
        return [...prev, newItem];
      });
      return true;
    }
  };

  const removeItem = async (cartItemId: number): Promise<boolean> => {
    if (!cartItemId || isNaN(cartItemId)) {
      console.error("❌ شناسه نامعتبر:", cartItemId);
      return false;
    }

    if (isAuthenticated && userId) {
      setLoading(true);
      try {
        const res = await fetch(`/api/cart?id=${cartItemId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "خطا در حذف محصول");
        }

        setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
        return true;
      } catch (err) {
        console.error("❌ خطا در حذف محصول:", err);
        // Fallback to local remove
        setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
        return true;
      } finally {
        setLoading(false);
      }
    } else {
      // Guest: local remove
      setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
      return true;
    }
  };

  const updateItemQuantity = async (
    cartItemId: number,
    quantity: number,
  ): Promise<boolean> => {
    if (!cartItemId) return false;

    if (quantity <= 0) {
      return removeItem(cartItemId);
    }

    if (isAuthenticated && userId) {
      setLoading(true);
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, quantity, userId }),
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
      // Guest: local update
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item,
        ),
      );
      return true;
    }
  };

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
      let orderRes;
      if (isAuthenticated && userId) {
        // Server checkout
        orderRes = await fetch("/api/orders", {
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
      } else {
        // Guest checkout: بدون userId، یا redirect به login
        console.log(
          "👤 Guest checkout - redirect to login or handle anonymously",
        );
        // مثال: window.location.href = '/login?checkout=true'; یا anonymous order API
        // فعلاً false برگردون برای تست
        throw new Error("لطفاً برای ثبت سفارش لاگین کنید");
      }

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "خطا در ثبت سفارش");
      }

      // Clear cart
      if (isAuthenticated) {
        await fetch("/api/cart/clear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
      }
      setCartItems([]);

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
