import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
  useMemo,
  useCallback,
} from "react";

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: TelegramUser | null;
  loading: boolean;
  isTelegram: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  const validateAndSetUser = useCallback(async (initData: string) => {
    try {
      console.log("📤 Validating Telegram user...");

      const response = await fetch("/api/validate-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("❌ Validation failed:", response.status);
        return false;
      }

      const result = await response.json();

      if (result.success && result.user && mountedRef.current) {
        setUser(result.user);
        console.log("✅ User authenticated:", result.user.id);
        return true;
      }

      console.error("❌ Validation error:", result?.error);
      return false;
    } catch (err) {
      console.error("❌ Validation exception:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (typeof window === "undefined") return;

    const initAuth = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;

        if (!tg) {
          console.error("❌ Telegram WebApp not available");
          setIsTelegram(false);
          setUser(null);
          return;
        }

        setIsTelegram(true);

        try {
          tg.ready?.();
          tg.expand?.();
        } catch {}

        const tgUser = tg.initDataUnsafe?.user;
        const initData = tg.initData;

        if (!tgUser?.id || !initData) {
          console.error("❌ Invalid Telegram initData");
          setUser(null);
          return;
        }

        console.log("👤 Telegram user:", tgUser.id);

        await validateAndSetUser(initData);
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        setUser(null);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    let tries = 0;
    const maxTries = 50;

    const interval = setInterval(() => {
      tries++;

      if ((window as any).Telegram?.WebApp) {
        clearInterval(interval);
        initAuth();
      } else if (tries >= maxTries) {
        clearInterval(interval);
        console.warn("⚠️ Telegram WebApp not detected");
        setLoading(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [validateAndSetUser]);

  const logout = useCallback(async () => {
    try {
      console.log("🚪 Logging out...");
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("❌ Logout error:", err);
    } finally {
      if (mountedRef.current) {
        setUser(null);
        window.location.href = "/";
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isTelegram,
      isAuthenticated: !!user?.id,
      isAdmin: user?.isAdmin ?? false,
      logout,
    }),
    [user, loading, isTelegram, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
