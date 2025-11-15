import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { departmentsApi, CreateDepartmentRequest, UpdateDepartmentRequest } from "../api/departments.api";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments.list,
    queryFn: departmentsApi.getAll,
  });
}

export function useDepartment(departmentId: string) {
  return useQuery({
    queryKey: ["departments", "detail", departmentId],
    queryFn: () => departmentsApi.getById(departmentId),
    enabled: !!departmentId,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      toast({
        title: "Department created",
        description: "Department has been created successfully",
      });
      router.push("/departments");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create department",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ departmentId, data }: { departmentId: string; data: UpdateDepartmentRequest }) =>
      departmentsApi.update(departmentId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      queryClient.invalidateQueries({ queryKey: ["departments", "detail", data.departmentId] });
      toast({
        title: "Department updated",
        description: "Department has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update department",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: departmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      toast({
        title: "Department deleted",
        description: "Department has been deleted successfully",
      });
      router.push("/departments");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete department",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useActivateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: departmentsApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      toast({
        title: "Department activated",
        description: "Department has been activated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to activate department",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: departmentsApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all });
      toast({
        title: "Department deactivated",
        description: "Department has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deactivate department",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
