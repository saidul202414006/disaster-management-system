"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type AuthUser = {
  user_id: string;
  email: string;
  role: "admin" | "victim";
  name: string;
  victim_id?: string;
  token?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isVictim: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAdmin: false,
  isVictim: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore from localStorage on mount
    try {
      const stored = localStorage.getItem("dms_user");
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      }
    } catch {
      // ignore corrupted data
    } finally {
      setLoading(false);
    }
  }, []);

  function login(userData: AuthUser) {
    setUser(userData);
    localStorage.setItem("dms_user", JSON.stringify(userData));
    if (userData.token) {
      localStorage.setItem("dms_token", userData.token);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("dms_user");
    localStorage.removeItem("dms_token");
    fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => {});
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === "admin",
      isVictim: user?.role === "victim",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// Hook: redirect to login if not admin
export function useRequireAdmin(redirectTo = "/admin/login") {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace(redirectTo);
    }
  }, [user, loading]);
  return { user, loading };
}

// Hook: redirect to victim login if not victim
export function useRequireVictim(redirectTo = "/victim/login") {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && (!user || user.role !== "victim")) {
      router.replace(redirectTo);
    }
  }, [user, loading]);
  return { user, loading };
}
