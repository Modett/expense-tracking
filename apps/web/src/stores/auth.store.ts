import { create } from "zustand";
import { User } from "@/lib/auth";
import { setToken, clearToken } from "@/lib/auth/token";

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  login: (user, token) => {
    setToken(token);
    set({ user, token });
  },
  logout: () => {
    clearToken();
    set({ user: null, token: null });
  },
}));
