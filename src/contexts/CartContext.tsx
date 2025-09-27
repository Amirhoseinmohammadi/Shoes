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
  loading: boolean;
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

  useEffect(() => {
    const loadCartFromAPI = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart?userId=1");
        if (res.ok) {
          const apiData = await res.json();

          const formattedItems: CartItem[] = apiData.map((item: any) => {
            const variant = item.product.variants.find(
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
              image,
              quantity: item.quantity,
              color: item.color,
            };
          });

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
          image: shoe.image,
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
            image:
              addedOrUpdatedItem.product?.image || addedOrUpdatedItem.image,
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
                addedOrUpdatedItem.product.image || addedOrUpdatedItem.image,
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
    if (!cartItemId) return false;

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

  const checkout = async (customer: { name: string; phone: string }) => {
    if (cartItems.length === 0) return false;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          items: cartItems,
          ...customer,
        }),
      });
      if (!res.ok) throw new Error("خطا در ثبت سفارش");
      await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: 1 }),
      });
      setCartItems([]);
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
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
