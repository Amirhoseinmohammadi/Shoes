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
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
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

  const initializingRef = useRef(false);
  const mountedRef = useRef(true);

  const checkExistingSession = useCallback(async () => {
    try {
      console.log("🔍 Checking existing session...");

      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.user) {
          console.log("✅ Found existing session:", result.user.id);
          if (mountedRef.current) {
            setUser(result.user);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error("❌ Session check error:", error);
      return false;
    }
  }, []);

  const validateAndSetUser = useCallback(async (initData: string) => {
    try {
      console.log("📤 Validating with server...");

      const response = await fetch("/api/validate-init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("❌ Validation failed:", response.status);
        if (mountedRef.current) setUser(null);
        return false;
      }

      const result = await response.json();

      if (result.success && result.user) {
        const userData: TelegramUser = result.user;
        if (mountedRef.current) {
          setUser(userData);
          console.log("✅ User authenticated:", userData.id);
          return true;
        }
      } else {
        console.error("❌ Validation error:", result.error);
        if (mountedRef.current) setUser(null);
      }
    } catch (error) {
      console.error("❌ Validation exception:", error);
      if (mountedRef.current) setUser(null);
    }
    return false;
  }, []);

  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    if (typeof window === "undefined") {
      if (mountedRef.current) {
        setLoading(false);
      }
      return;
    }

    const initAuth = async () => {
      try {
        const hasSession = await checkExistingSession();

        if (hasSession) {
          console.log("✅ User already authenticated via session");
          if (mountedRef.current) {
            setIsTelegram(true);
            setLoading(false);
          }
          return;
        }

        const tg = (window as any).Telegram?.WebApp;

        if (!tg) {
          console.log("⚠️ Not in Telegram environment");
          if (mountedRef.current) {
            setIsTelegram(false);
            setLoading(false);
          }
          return;
        }

        console.log("✅ Telegram WebApp found");
        if (mountedRef.current) {
          setIsTelegram(true);
        }

        try {
          tg.ready?.();
          tg.expand?.();
        } catch (e) {
          console.warn("⚠️ Could not call Telegram methods:", e);
        }

        const tgUser = tg.initDataUnsafe?.user;
        const initData = tg.initData;

        if (!tgUser?.id || !initData) {
          console.error("❌ No Telegram user data or initData");
          if (mountedRef.current) {
            setLoading(false);
          }
          return;
        }

        console.log("👤 Telegram user found:", tgUser.id);

        const success = await validateAndSetUser(initData);

        if (!success) {
          console.error("❌ Could not validate user");
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("❌ Auth init error:", error);
        if (mountedRef.current) {
          setUser(null);
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    let attempts = 0;
    const maxAttempts = 50;

    const checkInterval = setInterval(() => {
      attempts++;

      if ((window as any).Telegram?.WebApp) {
        clearInterval(checkInterval);
        initAuth();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn("⚠️ Telegram WebApp not available after 50 attempts");
        checkExistingSession().finally(() => {
          if (mountedRef.current) {
            setIsTelegram(false);
            setLoading(false);
          }
        });
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, [validateAndSetUser, checkExistingSession]);

  const logout = useCallback(async () => {
    try {
      console.log("🚪 Logging out...");

      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      console.log("✅ Logout successful");
    } catch (err) {
      console.error("❌ Logout error:", err);
    } finally {
      if (mountedRef.current) {
        setUser(null);
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
      isAdmin: user?.isAdmin || false,
      logout,
    }),
    [user, loading, isTelegram, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
