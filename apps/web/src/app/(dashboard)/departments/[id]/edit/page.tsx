"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useDepartment, useUpdateDepartment } from "@/features/departments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { withAdminGuard } from "@/hooks/with-admin-guard";

const updateDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
});

type UpdateDepartmentFormData = z.infer<typeof updateDepartmentSchema>;

function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const departmentId = params.id as string;

  const { data: department, isLoading } = useDepartment(departmentId);
  const updateDepartmentMutation = useUpdateDepartment();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateDepartmentFormData>({
    resolver: zodResolver(updateDepartmentSchema),
  });

  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        code: department.code || "",
        description: department.description || "",
      });
    }
  }, [department, reset]);

  const onSubmit = (data: UpdateDepartmentFormData) => {
    updateDepartmentMutation.mutate(
      {
        departmentId,
        data: {
          ...data,
          code: data.code || undefined,
          description: data.description || undefined,
        },
      },
      {
        onSuccess: () => router.push("/departments"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Department</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Department</h1>
          <p className="text-muted-foreground mt-2">Department not found</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-foreground">Edit Department</h1>
        <p className="text-muted-foreground mt-2">Update department information</p>
      </div>

      <Card className="bg-card border-border max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-muted-foreground">
              Department Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Engineering, Sales, Marketing"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="code" className="text-muted-foreground">
              Department Code
            </Label>
            <Input
              id="code"
              placeholder="e.g., ENG, SAL, MKT"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter department description"
              className="mt-2 bg-muted border-border text-foreground"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
            )}
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
              disabled={updateDepartmentMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateDepartmentMutation.isPending ? "Updating..." : "Update Department"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default withAdminGuard(EditDepartmentPage, { title: "Edit Department" });

