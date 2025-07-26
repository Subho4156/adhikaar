"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  kyc_type?: string;
  can_upload_reports?: boolean;
  vkyc_completed?: boolean;
  isProfessional?: boolean;
  advocateProfile?: {
    id: string;
    specialization: string[];
    hourly_rate: number;
    is_verified: boolean;
    is_available: boolean;
  } | null;
}

interface Session {
  user: User;
}

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.error(
          "Session check failed:",
          response.status,
          response.statusText
        );
        setSession(null);
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Response is not JSON:", contentType);
        const text = await response.text();
        console.error("Response text:", text.substring(0, 500));
        setSession(null);
        return;
      }

      const data = await response.json();

      if (data.session) {
        setSession(data.session);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // console.log("Attempting login for:", email);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Login failed:", response.status, response.statusText);
        const text = await response.text();
        console.error("Login error response:", text.substring(0, 500));
        return { success: false, error: "Login request failed" };
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Login response is not JSON:", contentType);
        const text = await response.text();
        console.error("Login response text:", text.substring(0, 500));
        return { success: false, error: "Invalid response format" };
      }

      const data = await response.json();
      // console.log("Login response data:", data);

      if (data.session) {
        // console.log("Login successful, setting session");
        setSession(data.session);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      // console.error("Login error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const register = async (userData: any) => {
    try {
      // console.log("Attempting registration for:", userData.email);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      // console.log("Register response status:", response.status);

      if (!response.ok) {
        console.error(
          "Registration failed:",
          response.status,
          response.statusText
        );
        const text = await response.text();
        // console.error("Registration error response:", text.substring(0, 500));
        return { success: false, error: "Registration request failed" };
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // console.error("Registration response is not JSON:", contentType);
        const text = await response.text();
        // console.error("Registration response text:", text.substring(0, 500));
        return { success: false, error: "Invalid response format" };
      }

      const data = await response.json();
      // console.log("Registration response data:", data);

      if (data.session) {
        // console.log("Registration successful, setting session");
        setSession(data.session);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      // console.error("Registration error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      // console.log("Logging out...");
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      // console.log("Logout successful");
    } catch (error) {
      // console.error("Logout error:", error);
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
