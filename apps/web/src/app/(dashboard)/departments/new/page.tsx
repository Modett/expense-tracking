"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCreateDepartment } from "@/features/departments";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

const createDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z.string().optional(),
  description: z.string().optional(),
});

type CreateDepartmentFormData = z.infer<typeof createDepartmentSchema>;

export default function CreateDepartmentPage() {
  const router = useRouter();
  const createDepartmentMutation = useCreateDepartment();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateDepartmentFormData>({
    resolver: zodResolver(createDepartmentSchema),
  });

  const onSubmit = (data: CreateDepartmentFormData) => {
    createDepartmentMutation.mutate({
      ...data,
      code: data.code || undefined,
      description: data.description || undefined,
    });
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
        <h1 className="text-3xl font-bold text-foreground">Add Department</h1>
        <p className="text-muted-foreground mt-2">Create a new department</p>
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
              disabled={createDepartmentMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {createDepartmentMutation.isPending ? "Creating..." : "Create Department"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

