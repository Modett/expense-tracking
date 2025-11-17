"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useUser, useUpdateUser, RoleEnum } from "@/features/users";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
  role: z.nativeEnum(RoleEnum, { required_error: "Role is required" }),
}).refine(
  (data) => {
    if (data.password || data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  },
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
).refine(
  (data) => {
    if (data.password && data.password.length > 0) {
      return data.password.length >= 6;
    }
    return true;
  },
  {
    message: "Password must be at least 6 characters",
    path: ["password"],
  }
);

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { data: user, isLoading } = useUser(userId);
  const updateUserMutation = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const selectedRole = watch("role");

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
        confirmPassword: "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: UpdateUserFormData) => {
    const { confirmPassword, password, ...userData } = data;

    const updateData = {
      ...userData,
      ...(password && password.length > 0 ? { password } : {}),
    };

    updateUserMutation.mutate(
      {
        userId,
        data: updateData,
      },
      {
        onSuccess: () => router.push("/users"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit User</h1>
          <p className="text-zinc-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit User</h1>
          <p className="text-zinc-400 mt-2">User not found</p>
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
        <h1 className="text-3xl font-bold text-white">Edit User</h1>
        <p className="text-zinc-400 mt-2">Update user information</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-zinc-300">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-zinc-300">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role" className="text-zinc-300">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as RoleEnum)}
            >
              <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value={RoleEnum.STAFF} className="text-white">
                  Staff - Regular employee
                </SelectItem>
                <SelectItem value={RoleEnum.MANAGER} className="text-white">
                  Manager - Department manager
                </SelectItem>
                <SelectItem value={RoleEnum.FINANCE} className="text-white">
                  Finance - Finance team member
                </SelectItem>
                <SelectItem value={RoleEnum.ADMIN} className="text-white">
                  Admin - System administrator
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="border-t border-zinc-800 pt-6">
            <p className="text-sm text-zinc-400 mb-4">
              Leave password fields empty to keep the current password
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="password" className="text-zinc-300">
                  New Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-zinc-300">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
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
              disabled={updateUserMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
