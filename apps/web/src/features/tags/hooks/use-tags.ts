import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tagsApi, CreateTagRequest, UpdateTagRequest, GetAllTagsParams } from "../api/tags.api";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function useTags(params?: GetAllTagsParams) {
  return useQuery({
    queryKey: params ? [...queryKeys.tags.list, params] : queryKeys.tags.list,
    queryFn: () => tagsApi.getAll(params),
  });
}

export function useTag(tagId: string) {
  return useQuery({
    queryKey: ["tags", "detail", tagId],
    queryFn: () => tagsApi.getById(tagId),
    enabled: !!tagId,
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: tagsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      toast({
        title: "Tag created",
        description: "Tag has been created successfully",
      });
      router.push("/tags");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create tag",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagRequest }) =>
      tagsApi.update(tagId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      queryClient.invalidateQueries({ queryKey: ["tags", "detail", variables.tagId] });
      toast({
        title: "Tag updated",
        description: "Tag has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update tag",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: tagsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      toast({
        title: "Tag deleted",
        description: "Tag has been deleted successfully",
      });
      router.push("/tags");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete tag",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useActivateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      toast({
        title: "Tag activated",
        description: "Tag has been activated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to activate tag",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tagsApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      toast({
        title: "Tag deactivated",
        description: "Tag has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deactivate tag",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
