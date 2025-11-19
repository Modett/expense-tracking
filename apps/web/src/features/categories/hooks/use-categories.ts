import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoriesApi, CreateCategoryRequest, UpdateCategoryRequest } from "../api/categories.api";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list,
    queryFn: categoriesApi.getAll,
  });
}

export function useCategory(categoryId: string) {
  return useQuery({
    queryKey: ["categories", "detail", categoryId],
    queryFn: () => categoriesApi.getById(categoryId),
    enabled: !!categoryId,
  });
}

export function useCreateCategory(options?: { skipNavigation?: boolean }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast({
        title: "Category created",
        description: "Category has been created successfully",
      });
      if (!options?.skipNavigation) {
        router.push("/categories");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create category",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateCategoryRequest }) =>
      categoriesApi.update(categoryId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      queryClient.invalidateQueries({ queryKey: ["categories", "detail", data.categoryId] });
      toast({
        title: "Category updated",
        description: "Category has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update category",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast({
        title: "Category deleted",
        description: "Category has been deleted successfully",
      });
      router.push("/categories");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete category",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useActivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast({
        title: "Category activated",
        description: "Category has been activated",
      });
    },
    onError: (error: any) => {
      const isForbidden = error?.response?.status === 403;
      toast({
        title: "Failed to activate category",
        description: isForbidden
          ? "You don't have permission to activate categories. Please contact an administrator."
          : error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast({
        title: "Category deactivated",
        description: "Category has been deactivated",
      });
    },
    onError: (error: any) => {
      const isForbidden = error?.response?.status === 403;
      toast({
        title: "Failed to deactivate category",
        description: isForbidden
          ? "You don't have permission to deactivate categories. Please contact an administrator."
          : error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
