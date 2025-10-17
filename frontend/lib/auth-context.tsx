// lib/auth-context.tsx
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  role: "ADMIN" | "VILLAGER";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use an environment variable for the API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("gramalert_user");
    const storedToken = localStorage.getItem("gramalert_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
      try {
          const response = await fetch(`${API_URL}/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password }),
          });

          if (!response.ok) {
              throw new Error('Login failed');
          }

          const data = await response.json();
          const loggedInUser: User = { username: data.username, role: data.role };

          setUser(loggedInUser);
          setToken(data.token);

          localStorage.setItem("gramalert_user", JSON.stringify(loggedInUser));
          localStorage.setItem("gramalert_token", data.token);

          if (loggedInUser.role === "ADMIN") {
              router.push("/admin-dashboard");
          } else {
              router.push("/villager-dashboard");
          }
      } catch (error) {
          console.error("Login error:", error);
          throw error;
      }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("gramalert_user");
    localStorage.removeItem("gramalert_token");
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}