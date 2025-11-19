"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useExpense, useUpdateExpense } from "@/features/expenses";
import { useCategories } from "@/features/categories";
import { useVendors } from "@/features/vendors";
import { useDepartments } from "@/features/departments";
import { useTags } from "@/features/tags";
import { ExpenseStatusEnum } from "@/features/expenses/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, ChevronsUpDown } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

const updateExpenseSchema = z
  .object({
    vendorId: z.string().uuid().optional().or(z.literal("")).or(z.null()),
    categoryId: z.string().uuid().optional(),
    departmentId: z.string().uuid().optional().or(z.literal("")).or(z.null()),
    description: z.string().min(1, "Description is required").max(1000, "Description too long").optional(),
    netAmount: z.number().positive("Net amount must be positive").optional(),
    taxAmount: z.number().min(0, "Tax amount cannot be negative").optional(),
    totalAmount: z.number().positive("Total amount must be positive").optional(),
    expenseDate: z.string().min(1, "Date is required").optional(),
    receiptUrl: z.string().url("Must be a valid URL").optional(),
    tagIds: z.array(z.string().uuid()).optional(),
  })
  .refine((data) => {
    if (data.netAmount !== undefined && data.taxAmount !== undefined && data.totalAmount !== undefined) {
      const total = data.netAmount + data.taxAmount;
      return Math.abs(total - data.totalAmount) < 0.01;
    }
    return true;
  }, {
    message: "Total amount must equal net amount + tax amount",
    path: ["totalAmount"],
  });

type UpdateExpenseFormData = z.infer<typeof updateExpenseSchema>;

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const expenseId = params.id as string;

  const { data: expense, isLoading: expenseLoading } = useExpense(expenseId);
  const { mutate: updateExpense, isPending } = useUpdateExpense();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const { data: tags, isLoading: tagsLoading } = useTags();

  const form = useForm<UpdateExpenseFormData>({
    resolver: zodResolver(updateExpenseSchema),
    defaultValues: {
      vendorId: "",
      categoryId: "",
      departmentId: "",
      description: "",
      netAmount: 0,
      taxAmount: 0,
      totalAmount: 0,
      expenseDate: "",
      receiptUrl: "",
      tagIds: [],
    },
  });

  const netAmount = form.watch("netAmount");
  const taxAmount = form.watch("taxAmount");

  useEffect(() => {
    if (expense) {
      form.reset({
        vendorId: expense.vendorId || "",
        categoryId: expense.categoryId,
        departmentId: expense.departmentId || "",
        description: expense.description,
        netAmount: expense.netAmount,
        taxAmount: expense.taxAmount,
        totalAmount: expense.totalAmount,
        expenseDate: expense.dateOfExpense.split("T")[0],
        receiptUrl: expense.receiptUrl || undefined,
        tagIds: expense.tagIds ?? [],
      });
    }
  }, [expense, form]);

  useEffect(() => {
    if (netAmount !== undefined && taxAmount !== undefined) {
      const total = (netAmount || 0) + (taxAmount || 0);
      form.setValue("totalAmount", parseFloat(total.toFixed(2)));
    }
  }, [netAmount, taxAmount, form]);

  const onSubmit = (data: UpdateExpenseFormData) => {
    const payload: UpdateExpenseFormData = {
      ...data,
      vendorId: data.vendorId || undefined,
      departmentId: data.departmentId || undefined,
      receiptUrl: data.receiptUrl || undefined,
      expenseDate: data.expenseDate ? new Date(data.expenseDate).toISOString() : undefined,
      tagIds: data.tagIds ?? [],
    };

    updateExpense({ expenseId, data: payload });
  };

  if (expenseLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64 bg-muted" />
          <Skeleton className="h-96 bg-muted" />
          <Skeleton className="h-64 bg-muted" />
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Expense Not Found</h2>
          <p className="text-muted-foreground mb-6">The expense you're looking for doesn't exist.</p>
          <Link href="/expenses">
            <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (expense.status !== ExpenseStatusEnum.DRAFT) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Cannot Edit Expense</h2>
          <p className="text-muted-foreground mb-6">
            Only draft expenses can be edited. This expense is {expense.status.toLowerCase()}.
          </p>
          <Link href={`/expenses/${expenseId}`}>
            <Button variant="outline" className="bg-muted border-border text-foreground hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expense Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/expenses/${expenseId}`}>
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expense Details
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Edit Expense</h1>
          <p className="text-muted-foreground mt-1">Update expense information</p>
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
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-2 bg-muted border border-border rounded-md text-foreground"
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
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-2 bg-muted border border-border rounded-md text-foreground"
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
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-2 bg-muted border border-border rounded-md text-foreground"
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
                        <FormControl>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full justify-between bg-muted border-border text-muted-foreground hover:bg-muted/80"
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
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Link href={`/expenses/${expenseId}`}>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

