import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vendorsApi, CreateVendorRequest, UpdateVendorRequest } from "../api/vendors.api";
import { queryKeys } from "@/lib/query/keys";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function useVendors() {
  return useQuery({
    queryKey: queryKeys.vendors.list,
    queryFn: vendorsApi.getAll,
  });
}

export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: ["vendors", "detail", vendorId],
    queryFn: () => vendorsApi.getById(vendorId),
    enabled: !!vendorId,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: vendorsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast({
        title: "Vendor created",
        description: "Vendor has been created successfully",
      });
      router.push("/vendors");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create vendor",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, data }: { vendorId: string; data: UpdateVendorRequest }) =>
      vendorsApi.update(vendorId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      queryClient.invalidateQueries({ queryKey: ["vendors", "detail", data.vendorId] });
      toast({
        title: "Vendor updated",
        description: "Vendor has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update vendor",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: vendorsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast({
        title: "Vendor deleted",
        description: "Vendor has been deleted successfully",
      });
      router.push("/vendors");
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete vendor",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useActivateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorsApi.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast({
        title: "Vendor activated",
        description: "Vendor has been activated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to activate vendor",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}

export function useDeactivateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorsApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      toast({
        title: "Vendor deactivated",
        description: "Vendor has been deactivated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to deactivate vendor",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    },
  });
}
