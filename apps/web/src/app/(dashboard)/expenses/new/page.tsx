"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateExpense } from "@/features/expenses";
import { useCategories } from "@/features/categories";
import { CreateCategoryDialog } from "@/features/categories/components";
import { useVendors } from "@/features/vendors";
import { CreateVendorDialog } from "@/features/vendors/components";
import { useDepartments } from "@/features/departments";
import { CreateDepartmentDialog } from "@/features/departments/components";
import { useTags } from "@/features/tags";
import { CreateTagDialog } from "@/features/tags/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save, ChevronsUpDown, Plus } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import type { Category, Vendor, Department, Tag } from "@/types/common.types";
import { useAuth } from "@/providers/auth-provider";

const createExpenseSchema = z.object({
  vendorId: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  departmentId: z.string().optional(),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  netAmount: z.number().positive("Net amount must be positive"),
  taxAmount: z.number().min(0, "Tax amount cannot be negative"),
  totalAmount: z.number().positive("Total amount must be positive"),
  expenseDate: z.string().min(1, "Date is required"),
  receiptUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tagIds: z.array(z.string().uuid()).optional(),
}).refine((data) => {
  const total = data.netAmount + data.taxAmount;
  return Math.abs(total - data.totalAmount) < 0.01;
}, {
  message: "Total amount must equal net amount + tax amount",
  path: ["totalAmount"],
});

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

export default function NewExpensePage() {
  const router = useRouter();
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateDepartmentOpen, setIsCreateDepartmentOpen] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const { mutate: createExpense, isPending } = useCreateExpense();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { data: tags, isLoading: tagsLoading } = useTags({ isActive: true });
  const { user } = useAuth();
  const isAdmin = typeof user?.role === "string" && user.role.toLowerCase() === "admin";

  const form = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      vendorId: "",
      categoryId: "",
      departmentId: "",
      description: "",
      netAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      expenseDate: new Date().toISOString().split("T")[0],
      receiptUrl: "",
      tagIds: [],
    },
  });

  const netAmount = form.watch("netAmount");
  const taxAmount = form.watch("taxAmount");

  useEffect(() => {
    const total = (netAmount || 0) + (taxAmount || 0);
    form.setValue("totalAmount", parseFloat(total.toFixed(2)));
  }, [netAmount, taxAmount, form]);

  const handleVendorCreated = (newVendor: Vendor) => {
    // Auto-select the newly created vendor
    form.setValue("vendorId", newVendor.vendorId);
  };

  const handleCategoryCreated = (newCategory: Category) => {
    // Auto-select the newly created category
    form.setValue("categoryId", newCategory.categoryId);
  };

  const handleDepartmentCreated = (newDepartment: Department) => {
    // Auto-select the newly created department
    form.setValue("departmentId", newDepartment.departmentId);
  };

  const handleTagCreated = (newTag: Tag) => {
    // Add the newly created tag to the selected tags
    const currentTagIds = form.getValues("tagIds") || [];
    form.setValue("tagIds", [...currentTagIds, newTag.tagId]);
  };

  const onSubmit = (data: CreateExpenseFormData) => {
    const payload = {
      ...data,
      expenseDate: new Date(data.expenseDate).toISOString(),
      vendorId: data.vendorId || undefined,
      departmentId: data.departmentId || undefined,
      receiptUrl: data.receiptUrl || undefined,
      tagIds: data.tagIds && data.tagIds.length > 0 ? data.tagIds : undefined,
    };
    createExpense(payload);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/expenses">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Create New Expense</h1>
          <p className="text-muted-foreground mt-1">Add a new expense record</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Expense Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          Vendor <span className="text-xs text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <select
                              {...field}
                              className="flex-1 px-4 py-2 bg-muted border border-border rounded-md text-foreground"
                              disabled={vendorsLoading}
                            >
                              <option value="">Select vendor (optional)</option>
                              {vendors?.map((vendor) => (
                                <option key={vendor.vendorId} value={vendor.vendorId}>
                                  {vendor.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          {isAdmin && (
                            <Button
                              type="button"
                              onClick={() => setIsCreateVendorOpen(true)}
                              className="px-3 bg-purple-600 hover:bg-purple-700 text-foreground"
                              title="Create new vendor"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Category *</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <select
                              {...field}
                              className="flex-1 px-4 py-2 bg-muted border border-border rounded-md text-foreground"
                              disabled={categoriesLoading}
                            >
                              <option value="">Select category</option>
                              {categories?.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          {isAdmin && (
                            <Button
                              type="button"
                              onClick={() => setIsCreateCategoryOpen(true)}
                              className="px-3 bg-purple-600 hover:bg-purple-700 text-foreground"
                              title="Create new category"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Department</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <select
                              {...field}
                              className="flex-1 px-4 py-2 bg-muted border border-border rounded-md text-foreground"
                              disabled={departmentsLoading}
                            >
                              <option value="">Select department (optional)</option>
                              {departments?.map((dept) => (
                                <option key={dept.departmentId} value={dept.departmentId}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </FormControl>
                          {isAdmin && (
                            <Button
                              type="button"
                              onClick={() => setIsCreateDepartmentOpen(true)}
                              className="px-3 bg-purple-600 hover:bg-purple-700 text-foreground"
                              title="Create new department"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expenseDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Expense Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-muted border-border text-foreground"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Description *</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Enter expense description..."
                          className="w-full px-4 py-2 bg-muted border border-border rounded-md text-foreground resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="netAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Net Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-muted border-border text-foreground"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Tax Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-muted border-border text-foreground"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">Total Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            disabled
                            className="bg-muted border-border text-foreground"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="receiptUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">Receipt URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/receipt.pdf"
                          {...field}
                          className="bg-muted border-border text-foreground"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagIds"
                  render={({ field }) => {
                    const selectedTagIds = field.value ?? [];
                    const selectedTags =
                      tags?.filter((tag) => selectedTagIds.includes(tag.tagId)) ?? [];

                    const summaryLabel = () => {
                      if (tagsLoading) return "Loading tags...";
                      if (!tags || tags.length === 0) return "No tags available";
                      if (selectedTags.length === 0) return "Select tags";
                      const preview = selectedTags.slice(0, 2).map((tag) => tag.name).join(", ");
                      const remaining = selectedTags.length - 2;
                      return remaining > 0 ? `${preview} +${remaining} more` : preview;
                    };

                    const toggleTag = (tagId: string, checked: boolean) => {
                      const nextValue = checked
                        ? [...selectedTagIds, tagId]
                        : selectedTagIds.filter((id) => id !== tagId);
                      field.onChange(nextValue);
                    };

                    return (
                      <FormItem>
                        <FormLabel className="text-muted-foreground">
                          Tags <span className="text-xs text-muted-foreground">(optional)</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="flex-1 justify-between bg-muted border-border text-muted-foreground hover:bg-muted/80"
                                  disabled={tagsLoading || !tags || tags.length === 0}
                                >
                                  <span className="truncate text-left">{summaryLabel()}</span>
                                  <ChevronsUpDown className="h-4 w-4 opacity-60" />
                                </Button>
                              </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="w-64 max-h-64 overflow-y-auto bg-card border-border text-foreground"
                              align="start"
                              side="bottom"
                            >
                              {tags?.map((tag) => {
                                const isSelected = selectedTagIds.includes(tag.tagId);
                                return (
                                  <DropdownMenuCheckboxItem
                                    key={tag.tagId}
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                      toggleTag(tag.tagId, Boolean(checked))
                                    }
                                    className="capitalize text-sm focus:bg-muted"
                                  >
                                    {tag.name}
                                  </DropdownMenuCheckboxItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </FormControl>
                        {isAdmin && (
                          <Button
                            type="button"
                            onClick={() => setIsCreateTagOpen(true)}
                            className="px-3 bg-purple-600 hover:bg-purple-700 text-foreground"
                            title="Create new tag"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Link href="/expenses">
                <Button type="button" variant="outline" className="bg-muted border-border text-foreground hover:bg-muted">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isPending ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Expense
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        <CreateVendorDialog
          open={isCreateVendorOpen}
          onOpenChange={setIsCreateVendorOpen}
          onVendorCreated={handleVendorCreated}
        />

        <CreateCategoryDialog
          open={isCreateCategoryOpen}
          onOpenChange={setIsCreateCategoryOpen}
          onCategoryCreated={handleCategoryCreated}
        />

        <CreateDepartmentDialog
          open={isCreateDepartmentOpen}
          onOpenChange={setIsCreateDepartmentOpen}
          onDepartmentCreated={handleDepartmentCreated}
        />

        <CreateTagDialog
          open={isCreateTagOpen}
          onOpenChange={setIsCreateTagOpen}
          onTagCreated={handleTagCreated}
        />
      </div>
    </div>
  );
}

