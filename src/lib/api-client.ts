const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "";

class ApiClient {
  private getBase() {
    return (
      API_BASE ||
      (typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:3000")
    );
  }

  private async request(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<any> {
    const base = this.getBase();
    const url = new URL(endpoint, base).toString();

    const isFormData =
      typeof (options as any).body !== "string" &&
      typeof FormData !== "undefined"
        ? (options as any).body instanceof FormData
        : false;

    const headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    };

    const config: RequestInit = {
      ...options,
      headers,

      credentials: (options.credentials as RequestCredentials) ?? "include",
    };

    try {
      console.log("🔄 apiClient request:", {
        url,
        config: { ...config, body: !!config.body },
      });

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

      return await response.text();
    } catch (error) {
      console.error("❌ apiClient request failed:", endpoint, error);
      throw error;
    }
  }

  auth = {
    login: (email: string, password: string) =>
      this.request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    register: (userData: any) =>
      this.request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      }),

    logout: () => this.request("/api/auth/logout", { method: "POST" }),

    getSession: () => this.request("/api/auth/session"),
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
      return this.request(url);
    },

    getById: (id: number) => this.request(`/api/products/${id}`),

    create: (productData: any) =>
      this.request("/api/products", {
        method: "POST",
        body: JSON.stringify(productData),
      }),

    update: (id: number, productData: any) =>
      this.request(`/api/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      }),

    delete: (id: number) =>
      this.request(`/api/products/${id}`, { method: "DELETE" }),

    search: (query: string) =>
      this.request(`/api/products/search?q=${encodeURIComponent(query)}`),
  };

  orders = {
    getAll: (userId?: number) => {
      const url = userId ? `/api/orders?userId=${userId}` : "/api/orders";
      return this.request(url);
    },

    getById: (id: number) => this.request(`/api/orders/${id}`),

    create: (orderData: any) =>
      this.request("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      }),

    updateStatus: (id: number, status: string) =>
      this.request(`/api/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),

    delete: (id: number) =>
      this.request(`/api/orders/${id}`, { method: "DELETE" }),
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
      this.request("/api/telegram/validate-init", {
        method: "POST",
        body: JSON.stringify({ initData }),
      }),

    getUser: (userId: number) => this.request(`/api/telegram/user/${userId}`),

    sendMessage: (userId: number, message: string) =>
      this.request("/api/telegram/send-message", {
        method: "POST",
        body: JSON.stringify({ userId, message }),
      }),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
