"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateTag } from "../hooks/use-tags";
import { TagTypeEnum } from "../types";
import type { Tag } from "../types";

const createTagSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  type: z.nativeEnum(TagTypeEnum, { required_error: "Type is required" }),
});

type CreateTagFormData = z.infer<typeof createTagSchema>;

interface CreateTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagCreated?: (tag: Tag) => void;
}

export function CreateTagDialog({
  open,
  onOpenChange,
  onTagCreated,
}: CreateTagDialogProps) {
  const { mutate: createTag, isPending } = useCreateTag({ skipNavigation: true });

  const form = useForm<CreateTagFormData>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: "",
      type: TagTypeEnum.CUSTOM,
    },
  });

  const onSubmit = (data: CreateTagFormData) => {
    createTag(
      {
        name: data.name,
        type: data.type,
      },
      {
        onSuccess: (newTag) => {
          form.reset();
          onOpenChange(false);
          onTagCreated?.(newTag);
        },
      }
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
          <DialogDescription>
            Add a new tag to categorize your expenses.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    Tag Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Q1 2024, Holiday Sale"
                      className="bg-zinc-800 border-zinc-700 text-white"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    Tag Type <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                      disabled={isPending}
                    >
                      <option value={TagTypeEnum.CUSTOM}>Custom</option>
                      <option value={TagTypeEnum.COLLECTION}>Collection</option>
                      <option value={TagTypeEnum.CAMPAIGN}>Campaign</option>
                      <option value={TagTypeEnum.DEPARTMENT}>Department</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
                className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isPending ? "Creating..." : "Create Tag"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
