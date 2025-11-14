"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { getUserFromToken, isAuthenticated } from "@/lib/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: ReturnType<typeof getUserFromToken>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated()) {
      const userData = getUserFromToken();
      setUser(userData);
    }
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
