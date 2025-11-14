import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/index";
import { LoginRequest, RegisterRequest, ChangePasswordRequest } from "../types/index";
import { setToken, setRefreshToken, clearToken, getToken } from "@/lib/auth/token";
import { queryKeys } from "@/lib/query/keys";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      toast({
        title: "Login successful!",
        description: "Welcome back to Expensio",
        variant: "default",
      });
      router.push("/");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "Invalid email or password",
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      toast({
        title: "Registration successful!",
        description: "Your account has been created successfully",
        variant: "default",
      });
      router.push("/");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearToken();
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
        variant: "default",
      });
      router.push("/login");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
  });
}

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getMe,
    retry: false,
    enabled: false, // Disable for now - backend endpoint doesn't exist
  });
}
