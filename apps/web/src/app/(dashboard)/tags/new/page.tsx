"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCreateTag, TagTypeEnum } from "@/features/tags";
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

const createTagSchema = z.object({
  name: z.string().min(1, "Tag name is required"),
  type: z.nativeEnum(TagTypeEnum, { required_error: "Tag type is required" }),
});

type CreateTagFormData = z.infer<typeof createTagSchema>;

export default function CreateTagPage() {
  const router = useRouter();
  const createTagMutation = useCreateTag();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateTagFormData>({
    resolver: zodResolver(createTagSchema),
  });

  const selectedType = watch("type");

  const onSubmit = (data: CreateTagFormData) => {
    createTagMutation.mutate(data);
  };

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
        <h1 className="text-3xl font-bold text-white">Add Tag</h1>
        <p className="text-zinc-400 mt-2">Create a new tag for expense tracking</p>
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
              disabled={createTagMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {createTagMutation.isPending ? "Creating..." : "Create Tag"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
