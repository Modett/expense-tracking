"use client";

import React, { createContext, useContext } from "react";
import { useMe } from "@/features/auth";
import { User } from "@/types/common.types";
import { getToken } from "@/lib/auth/token";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";

interface AuthContextType {
  user: User | null | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = getToken();
  const { data: user, isLoading } = useMe();
  const queryClient = useQueryClient();

  const refreshUser = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!token && !!user,
    isLoading,
    refreshUser,
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

// Alias for backward compatibility
export { useAuth as useAuthContext };
