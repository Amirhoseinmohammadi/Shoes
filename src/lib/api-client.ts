import type {
  ApiResponse,
  Product,
  ProductInput,
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  AuthUser,
  ValidateInitResponse,
} from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "";

class ApiClient {
  public getBase() {
    return (
      API_BASE ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000")
    );
  }

  public async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const base = this.getBase();
    const url = new URL(endpoint, base).toString();

    const isFormData =
      typeof (options as any).body !== "string" &&
      typeof FormData !== "undefined"
        ? (options as any).body instanceof FormData
        : false;

    const headers = {
      // NOTE: Using 'Content-Type': 'application/json' if NOT FormData.
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    };

    const config: RequestInit = {
      ...options,
      headers,
      // Ensure credentials is explicitly included by default
      credentials: (options.credentials as RequestCredentials) ?? "include",
    };

    try {
      

      const response = await fetch(url, config);

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        let errorBody: any = null;
        try {
          if (contentType.includes("application/json")) {
            errorBody = await response.json();
          } else {
            errorBody = await response.text();
          }
        } catch (e) {}

        const message =
          (errorBody && (errorBody.error || errorBody.message)) ||
          response.statusText ||
          `HTTP error ${response.status}`;

        const err: any = new Error(message);
        err.status = response.status;
        err.body = errorBody;
        throw err;
      }

      if (response.status === 204) return null;

      if (contentType.includes("application/json")) {
        return await response.json();
      }

      // Return text if content type is not JSON (e.g., HTML, plain text)
      return (await response.text()) as unknown as T;
    } catch (error) {
      console.error("❌ apiClient request failed:", endpoint, error);
      throw error;
    }
  }

  // --- Endpoints remain the same, relying on the now public request method ---

  auth = {
    logout: () =>
      this.request<ApiResponse<null>>("/api/auth/logout", { method: "POST" }),

    getSession: () => this.request<ApiResponse<AuthUser>>("/api/auth/session"),
  };

  users = {
    getAll: () => this.request("/api/users"),

    getById: (id: number) => this.request(`/api/users/${id}`),

    update: (id: number, userData: any) =>
      this.request(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      }),

    delete: (id: number) =>
      this.request(`/api/users/${id}`, { method: "DELETE" }),
  };

  products = {
    getAll: (category?: string) => {
      const url = category
        ? `/api/products?category=${encodeURIComponent(category)}`
        : "/api/products";
      return this.request<ApiResponse<Product[]>>(url);
    },

    getById: (id: number) =>
      this.request<ApiResponse<Product>>(`/api/products/${id}`),

    create: (productData: ProductInput) =>
      this.request<ApiResponse<Product>>("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      }),

    update: (id: number, productData: Partial<ProductInput>) =>
      this.request<ApiResponse<Product>>(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      }),

    delete: (id: number) =>
      this.request<ApiResponse<null>>(`/api/products/${id}`, {
        method: "DELETE",
      }),
  };

  orders = {
    getAll: (userId?: number) => {
      const url = userId ? `/api/orders?userId=${userId}` : "/api/orders";
      return this.request<ApiResponse<Order[]>>(url);
    },

    getById: (id: number) =>
      this.request<ApiResponse<Order>>(`/api/orders/${id}`),

    create: (orderData: CreateOrderInput) =>
      this.request<ApiResponse<Order>>("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      }),

    updateStatus: (id: number, status: UpdateOrderStatusInput["status"]) =>
      this.request<ApiResponse<Order>>(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),

    delete: (id: number) =>
      this.request<ApiResponse<null>>(`/api/orders/${id}`, {
        method: "DELETE",
      }),
  };

  categories = {
    getAll: () => this.request("/api/categories"),

    getById: (id: number) => this.request(`/api/categories/${id}`),
  };

  comments = {
    getByProduct: (productId: number) =>
      this.request(`/api/comments?productId=${productId}`),

    create: (commentData: any) =>
      this.request("/api/comments", {
        method: "POST",
        body: JSON.stringify(commentData),
      }),

    delete: (id: number) =>
      this.request(`/api/comments/${id}`, { method: "DELETE" }),
  };

  telegram = {
    validateInit: (initData: string) =>
      this.request<ValidateInitResponse>("/api/validate-init", {
        method: "POST",
        body: JSON.stringify({ initData }),
      }),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
