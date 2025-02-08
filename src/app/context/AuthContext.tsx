"use client";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getRefreshToken = async (refreshToken: string) => {
        console.log("is here refreshToken", refreshToken);
        const res = await fetch("/api/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
        });

        console.log("res", res);

        if (!res.ok) {
            throw new Error("Refresh token failed");
        }

        const data = await res.json();
        console.log("data", data);
    }

    const checkAuth = async () => {
      setIsLoading(true);
      if (isAuthenticated) return;

      try {
        const res = await fetch("/api/auth/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken }),
        });

        if (!res.ok) {
            throw new Error("Check auth failed");
        }

        const data = await res.json();
        const { isAuthenticated, isAdmin, refreshToken } = data;

        if (!refreshToken) {
            // user is not authenticated
            setIsAuthenticated(false);
            setIsAdmin(false);
            return;
        }

        if (isAuthenticated) {
            setIsAuthenticated(true);
            setIsAdmin(isAdmin);
        } else {
            // try refresh
            console.log('passing refresh token', refreshToken);
            getRefreshToken(refreshToken);
        }
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password}),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();
      
      setAccessToken(data.accessToken);
      setIsAuthenticated(true);
      setIsAdmin(data.isAdmin);
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsAuthenticated(false);
    setIsAdmin(false);
    setAccessToken(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, isLoading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
