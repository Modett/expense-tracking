import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, CreateUserRequest, UpdateUserRequest, GetAllUsersParams } from "../api/users";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function useUsers(params?: GetAllUsersParams) {
  return useQuery({
    queryKey: params ? queryKeys.users.list(params as Record<string, unknown>) : queryKeys.users.all,
    queryFn: () => usersApi.getAll(params),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({
        title: "User created",
        description: "User has been created successfully",
      });
      router.push("/users");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      usersApi.update(userId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(data.userId) });
      toast({
        title: "User updated",
        description: "User has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update user",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      router.push("/users");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({
        title: "User activated",
        description: "User has been activated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to activate user",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast({
        title: "User deactivated",
        description: "User has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deactivate user",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
