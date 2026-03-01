import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { User, AuthState } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "ecom_auth";

// Mock users db in localStorage
function getUsers(): Array<User & { password: string }> {
  const raw = localStorage.getItem("ecom_users");
  if (!raw) {
    // Seed admin user
    const seed = [
      { id: "u1", name: "Admin", email: "admin@store.com", password: "admin123", role: "admin" as const, created_at: new Date().toISOString() },
    ];
    localStorage.setItem("ecom_users", JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(raw);
}

function saveUsers(users: Array<User & { password: string }>) {
  localStorage.setItem("ecom_users", JSON.stringify(users));
}

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
    const users = getUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Invalid email or password" };
    const token = "mock_jwt_" + found.id + "_" + Date.now();
    const { password: _, ...user } = found;
    setState({ user, token, isAuthenticated: true });
    return { success: true };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const users = getUsers();
    if (users.find((u) => u.email === email)) return { success: false, error: "Email already registered" };
    const newUser = {
      id: "u" + Date.now(),
      name,
      email,
      password,
      role: "user" as const,
      created_at: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const token = "mock_jwt_" + newUser.id + "_" + Date.now();
    const { password: _, ...user } = newUser;
    setState({ user, token, isAuthenticated: true });
    return { success: true };
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
