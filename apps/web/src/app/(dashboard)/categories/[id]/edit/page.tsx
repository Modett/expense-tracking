"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useCategory, useUpdateCategory } from "@/features/categories";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const { data: category, isLoading } = useCategory(categoryId);
  const updateCategoryMutation = useUpdateCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateCategoryFormData>({
    resolver: zodResolver(updateCategorySchema),
  });

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || "",
      });
    }
  }, [category, reset]);

  const onSubmit = (data: UpdateCategoryFormData) => {
    updateCategoryMutation.mutate(
      {
        categoryId,
        data: {
          ...data,
          description: data.description || undefined,
        },
      },
      {
        onSuccess: () => router.push("/categories"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Category</h1>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Edit Category</h1>
          <p className="text-muted-foreground mt-2">Category not found</p>
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
        <h1 className="text-3xl font-bold text-foreground">Edit Category</h1>
        <p className="text-muted-foreground mt-2">Update category information</p>
      </div>

      <Card className="bg-card border-border max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-muted-foreground">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Travel, Office Supplies, Marketing"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description" className="text-muted-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter category description"
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
              disabled={updateCategoryMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

