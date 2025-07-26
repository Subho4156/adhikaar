"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  vkyc_completed?: boolean;
}

interface Session {
  user: User;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check session from /api/auth/session
  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.session || null);
      } else {
        setSession(null);
      }
    } catch (error) {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Called on mount
  useEffect(() => {
    checkSession();
  }, []);

  // ✅ Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || "Login failed" };
      }

      await checkSession(); // Refresh session
      return { success: true };
    } catch (err) {
      return { success: false, error: "Something went wrong" };
    }
  };

  // ✅ Register function
  const register = async (userData: any) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || "Register failed" };
      }

      await checkSession(); // Refresh session
      return { success: true };
    } catch (err) {
      return { success: false, error: "Something went wrong" };
    }
  };

  // ✅ Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Ignore logout errors
    } finally {
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ session, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
