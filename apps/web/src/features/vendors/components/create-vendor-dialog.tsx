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
import { useCreateVendor } from "../hooks/use-vendors";
import type { Vendor } from "@/types/common.types";

const createVendorSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  contactInfo: z.string().max(500, "Contact info is too long").optional(),
});

type CreateVendorFormData = z.infer<typeof createVendorSchema>;

interface CreateVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVendorCreated?: (vendor: Vendor) => void;
}

export function CreateVendorDialog({
  open,
  onOpenChange,
  onVendorCreated,
}: CreateVendorDialogProps) {
  const { mutate: createVendor, isPending } = useCreateVendor({ skipNavigation: true });

  const form = useForm<CreateVendorFormData>({
    resolver: zodResolver(createVendorSchema),
    defaultValues: {
      name: "",
      description: "",
      contactInfo: "",
    },
  });

  const onSubmit = (data: CreateVendorFormData) => {
    createVendor(
      {
        name: data.name,
        description: data.description || undefined,
        contactInfo: data.contactInfo || undefined,
      },
      {
        onSuccess: (newVendor) => {
          form.reset();
          onOpenChange(false);
          onVendorCreated?.(newVendor);
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
          <DialogTitle>Create New Vendor</DialogTitle>
          <DialogDescription>
            Add a new vendor to track expenses.
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
                    Vendor Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Office Depot, Amazon"
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    Description <span className="text-xs text-zinc-500">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={2}
                      placeholder="Enter vendor description..."
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white resize-none"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-zinc-300">
                    Contact Info <span className="text-xs text-zinc-500">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., email, phone, or website"
                      className="bg-zinc-800 border-zinc-700 text-white"
                      disabled={isPending}
                    />
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
                {isPending ? "Creating..." : "Create Vendor"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
