import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User, AuthState } from "@/types";
import { api, ApiError } from "@/lib/api";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "ecom_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { user: parsed.user, token: parsed.token, isAuthenticated: true };
    }
    return { user: null, token: null, isAuthenticated: false };
  });

  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user, token: state.token }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.post<{ user: User; token: string }>("/auth/login", { email, password });
      setState({ user: response.user, token: response.token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Login failed" };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await api.post<{ user: User; token: string }>("/auth/register", {
        name,
        email,
        password,
      });
      setState({ user: response.user, token: response.token, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: "Registration failed" };
    }
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, token: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
