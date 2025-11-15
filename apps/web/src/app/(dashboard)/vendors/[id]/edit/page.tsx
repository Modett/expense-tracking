"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useVendor, useUpdateVendor } from "@/features/vendors";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const updateVendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  gstNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type UpdateVendorFormData = z.infer<typeof updateVendorSchema>;

export default function EditVendorPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = params.id as string;

  const { data: vendor, isLoading } = useVendor(vendorId);
  const updateVendorMutation = useUpdateVendor();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateVendorFormData>({
    resolver: zodResolver(updateVendorSchema),
  });

  useEffect(() => {
    if (vendor) {
      reset({
        name: vendor.name,
        gstNumber: vendor.gstNumber || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        address: vendor.address || "",
      });
    }
  }, [vendor, reset]);

  const onSubmit = (data: UpdateVendorFormData) => {
    updateVendorMutation.mutate(
      {
        vendorId,
        data: {
          ...data,
          email: data.email || undefined,
          gstNumber: data.gstNumber || undefined,
          phone: data.phone || undefined,
          address: data.address || undefined,
        },
      },
      {
        onSuccess: () => router.push("/vendors"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Vendor</h1>
          <p className="text-zinc-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Vendor</h1>
          <p className="text-zinc-400 mt-2">Vendor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800 mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-white">Edit Vendor</h1>
        <p className="text-zinc-400 mt-2">Update vendor information</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-zinc-300">
              Vendor Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="ABC Suppliers Pvt Ltd"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="gstNumber" className="text-zinc-300">
              GST Number
            </Label>
            <Input
              id="gstNumber"
              placeholder="22AAAAA0000A1Z5"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              {...register("gstNumber")}
            />
            {errors.gstNumber && (
              <p className="text-sm text-red-500 mt-1">{errors.gstNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vendor@example.com"
                className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone" className="text-zinc-300">
                Phone
              </Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-zinc-300">
              Address
            </Label>
            <Textarea
              id="address"
              placeholder="Enter vendor address"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              rows={3}
              {...register("address")}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateVendorMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateVendorMutation.isPending ? "Updating..." : "Update Vendor"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
