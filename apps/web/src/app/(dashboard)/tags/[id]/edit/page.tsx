"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { useTag, useUpdateTag, TagTypeEnum } from "@/features/tags";
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

const updateTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  type: z.nativeEnum(TagTypeEnum, { required_error: "Tag type is required" }),
});

type UpdateTagFormData = z.infer<typeof updateTagSchema>;

export default function EditTagPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = params.id as string;

  const { data: tag, isLoading } = useTag(tagId);
  const updateTagMutation = useUpdateTag();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateTagFormData>({
    resolver: zodResolver(updateTagSchema),
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (tag) {
      reset({
        name: tag.name,
        type: tag.type,
      });
    }
  }, [tag, reset]);

  const onSubmit = (data: UpdateTagFormData) => {
    updateTagMutation.mutate(
      {
        tagId,
        data,
      },
      {
        onSuccess: () => router.push("/tags"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Tag</h1>
          <p className="text-zinc-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Edit Tag</h1>
          <p className="text-zinc-400 mt-2">Tag not found</p>
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
        <h1 className="text-3xl font-bold text-white">Edit Tag</h1>
        <p className="text-zinc-400 mt-2">Update tag information</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label htmlFor="name" className="text-zinc-300">
              Tag Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Q4 Campaign, Project Alpha"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type" className="text-zinc-300">
              Tag Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue("type", value as TagTypeEnum)}
            >
              <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select tag type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value={TagTypeEnum.COLLECTION} className="text-white">
                  Collection
                </SelectItem>
                <SelectItem value={TagTypeEnum.CAMPAIGN} className="text-white">
                  Campaign
                </SelectItem>
                <SelectItem value={TagTypeEnum.CUSTOM} className="text-white">
                  Custom
                </SelectItem>
                <SelectItem value={TagTypeEnum.DEPARTMENT} className="text-white">
                  Department
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
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
              disabled={updateTagMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateTagMutation.isPending ? "Updating..." : "Update Tag"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
