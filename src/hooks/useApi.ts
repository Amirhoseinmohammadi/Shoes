import useSWR from "swr";
import { apiClient } from "@/lib/api-client";

const defaultConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
};

export const useApi = {
  // Authentication
  useSession: () => useSWR("session", apiClient.auth.getSession, defaultConfig),

  // Users
  useUsers: () => useSWR("users", apiClient.users.getAll, defaultConfig),

  useUser: (id: number) =>
    useSWR(
      id ? ["user", id] : null,
      () => apiClient.users.getById(id),
      defaultConfig,
    ),

  // Products
  useProducts: (category?: string) =>
    useSWR(
      category !== undefined ? ["products", category] : "products",
      () => apiClient.products.getAll(category),
      defaultConfig,
    ),

  useProduct: (id: number) =>
    useSWR(
      id ? ["product", id] : null,
      () => apiClient.products.getById(id),
      defaultConfig,
    ),

  // Orders
  useOrders: (userId?: number) =>
    useSWR(
      userId !== undefined ? ["orders", userId] : null,
      () => apiClient.orders.getAll(userId),
      defaultConfig,
    ),

  useOrder: (id: number) =>
    useSWR(
      id ? ["order", id] : null,
      () => apiClient.orders.getById(id),
      defaultConfig,
    ),

  // Categories
  useCategories: () =>
    useSWR("categories", apiClient.categories.getAll, defaultConfig),

  // Comments
  useComments: (productId: number) =>
    useSWR(
      productId ? ["comments", productId] : null,
      () => apiClient.comments.getByProduct(productId),
      defaultConfig,
    ),
};

// 🔄 Export useSWR و mutate
export { useSWR, mutate } from "swr";
