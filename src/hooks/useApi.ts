import useSWR from "swr";
import { apiClient } from "@/lib/api-client";

const defaultConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
};

export const useApi = {
  useSession: () => useSWR("session", apiClient.auth.getSession, defaultConfig),

  useUsers: () => useSWR("users", apiClient.users.getAll, defaultConfig),

  useUser: (id: number) =>
    useSWR(
      id ? ["user", id] : null,
      () => apiClient.users.getById(id),
      defaultConfig,
    ),

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

  useCategories: () =>
    useSWR("categories", apiClient.categories.getAll, defaultConfig),

  useComments: (productId: number) =>
    useSWR(
      productId ? ["comments", productId] : null,
      () => apiClient.comments.getByProduct(productId),
      defaultConfig,
    ),
};

export { default as useSWR } from "swr";
export { mutate } from "swr";
