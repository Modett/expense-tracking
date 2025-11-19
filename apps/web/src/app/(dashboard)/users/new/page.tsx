"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCreateUser, RoleEnum } from "@/features/users";
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

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.nativeEnum(RoleEnum, { required_error: "Role is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const createUserMutation = useCreateUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  });

  const selectedRole = watch("role");

  const onSubmit = (data: CreateUserFormData) => {
    const { confirmPassword, ...userData } = data;
    createUserMutation.mutate(userData);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-muted mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Add User</h1>
        <p className="text-muted-foreground mt-2">Create a new user account</p>
      </div>

      <Card className="bg-card border-border max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-muted-foreground">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-muted-foreground">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role" className="text-muted-foreground">
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(value) => setValue("role", value as RoleEnum)}
            >
              <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value={RoleEnum.STAFF} className="text-foreground">
                  Staff - Regular employee
                </SelectItem>
                <SelectItem value={RoleEnum.MANAGER} className="text-foreground">
                  Manager - Department manager
                </SelectItem>
                <SelectItem value={RoleEnum.FINANCE} className="text-foreground">
                  Finance - Finance team member
                </SelectItem>
                <SelectItem value={RoleEnum.ADMIN} className="text-foreground">
                  Admin - System administrator
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="password" className="text-muted-foreground">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className="mt-2 bg-muted border-border text-foreground"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-muted-foreground">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                className="mt-2 bg-muted border-border text-foreground"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="flex-1 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createUserMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

