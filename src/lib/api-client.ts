const API_BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // 🔐 Authentication
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

  // 👤 Users
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

  // 👟 Products
  products = {
    getAll: (category?: string) => {
      const url = category
        ? `/api/products?category=${category}`
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

    search: (query: string) => this.request(`/api/products/search?q=${query}`),
  };

  // 🛒 Orders
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

  // 📦 Categories
  categories = {
    getAll: () => this.request("/api/categories"),

    getById: (id: number) => this.request(`/api/categories/${id}`),
  };

  // 💬 Comments
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
