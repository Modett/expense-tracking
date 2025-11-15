"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateExpense } from "@/features/expenses";
import { useCategories } from "@/features/categories";
import { useVendors } from "@/features/vendors";
import { useDepartments } from "@/features/departments";
import { ExpensePriorityEnum, BudgetExceptionTypeEnum } from "@/features/expenses/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const createExpenseSchema = z.object({
  vendorId: z.string().min(1, "Vendor is required"),
  categoryId: z.string().min(1, "Category is required"),
  departmentId: z.string().optional(),
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  netAmount: z.number().positive("Net amount must be positive"),
  taxAmount: z.number().min(0, "Tax amount cannot be negative"),
  totalAmount: z.number().positive("Total amount must be positive"),
  expenseDate: z.string().min(1, "Date is required"),
  receiptUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  priority: z.nativeEnum(ExpensePriorityEnum).optional(),
  budgetOverride: z.nativeEnum(BudgetExceptionTypeEnum).optional(),
  justification: z.string().optional(),
}).refine((data) => {
  const total = data.netAmount + data.taxAmount;
  return Math.abs(total - data.totalAmount) < 0.01;
}, {
  message: "Total amount must equal net amount + tax amount",
  path: ["totalAmount"],
}).refine((data) => {
  if (data.budgetOverride && data.budgetOverride !== BudgetExceptionTypeEnum.NONE) {
    return data.justification && data.justification.length >= 10;
  }
  return true;
}, {
  message: "Justification is required when budget override is selected (min 10 characters)",
  path: ["justification"],
});

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>;

export default function NewExpensePage() {
  const router = useRouter();
  const { mutate: createExpense, isPending } = useCreateExpense();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: vendors, isLoading: vendorsLoading } = useVendors();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();

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
      priority: ExpensePriorityEnum.STANDARD,
      budgetOverride: BudgetExceptionTypeEnum.NONE,
      justification: "",
    },
  });

  const netAmount = form.watch("netAmount");
  const taxAmount = form.watch("taxAmount");
  const budgetOverride = form.watch("budgetOverride");

  useEffect(() => {
    const total = (netAmount || 0) + (taxAmount || 0);
    form.setValue("totalAmount", parseFloat(total.toFixed(2)));
  }, [netAmount, taxAmount, form]);

  const onSubmit = (data: CreateExpenseFormData) => {
    const payload = {
      ...data,
      departmentId: data.departmentId || undefined,
      receiptUrl: data.receiptUrl || undefined,
      justification: data.justification || undefined,
    };
    createExpense(payload);
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/expenses">
            <Button variant="ghost" className="text-zinc-400 hover:text-white mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Expenses
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Create New Expense</h1>
          <p className="text-zinc-400 mt-1">Add a new expense record</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Expense Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Vendor *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                            disabled={vendorsLoading}
                          >
                            <option value="">Select vendor</option>
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
                        <FormLabel className="text-zinc-300">Category *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
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
                        <FormLabel className="text-zinc-300">Department</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
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
                        <FormLabel className="text-zinc-300">Expense Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-zinc-800 border-zinc-700 text-white"
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
                      <FormLabel className="text-zinc-300">Description *</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={3}
                          placeholder="Enter expense description..."
                          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white resize-none"
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
                        <FormLabel className="text-zinc-300">Net Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-zinc-800 border-zinc-700 text-white"
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
                        <FormLabel className="text-zinc-300">Tax Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            className="bg-zinc-800 border-zinc-700 text-white"
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
                        <FormLabel className="text-zinc-300">Total Amount *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            disabled
                            className="bg-zinc-800 border-zinc-700 text-white"
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
                      <FormLabel className="text-zinc-300">Receipt URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/receipt.pdf"
                          {...field}
                          className="bg-zinc-800 border-zinc-700 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Additional Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Priority</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                          >
                            {Object.values(ExpensePriorityEnum).map((priority) => (
                              <option key={priority} value={priority}>
                                {priority.charAt(0) + priority.slice(1).toLowerCase()}
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
                    name="budgetOverride"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Budget Override</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
                          >
                            {Object.values(BudgetExceptionTypeEnum).map((type) => (
                              <option key={type} value={type}>
                                {type.charAt(0) + type.slice(1).toLowerCase()}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {budgetOverride && budgetOverride !== BudgetExceptionTypeEnum.NONE && (
                  <FormField
                    control={form.control}
                    name="justification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-zinc-300">Justification *</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={3}
                            placeholder="Enter justification for budget override (minimum 10 characters)..."
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex items-center justify-end gap-4">
              <Link href="/expenses">
                <Button type="button" variant="outline" className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
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
      </div>
    </div>
  );
}
