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
};

const AuthContext = createContext<AuthContextType>({
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/auth/check");
        const isAuthed = await res.json();
        setIsAuthenticated(isAuthed.authenticated);
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
          console.log('res', res)
        throw new Error("Login failed");
      }

      setIsAuthenticated(true);
      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST" });
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
