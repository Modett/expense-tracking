"use client";

import React, { createContext, useContext } from "react";
import { useMe } from "@/features/auth";
import { User } from "@/types/common.types";
import { getToken } from "@/lib/auth/token";

interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = getToken();
  const { data: user, isLoading } = useMe();

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!token && !!user,
    isLoading,
  };

  // Don't block rendering on loading state
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
