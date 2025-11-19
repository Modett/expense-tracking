"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useCreateApprovalRule, ApproverRoleEnum } from "@/features/approval-rules";
import { useCategories } from "@/features/categories";
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
import { withAdminGuard } from "@/hooks/with-admin-guard";

const createRuleSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  minAmount: z.number().min(0, "Minimum amount must be 0 or greater"),
  approverRole: z.nativeEnum(ApproverRoleEnum),
  approvalOrder: z.number().min(1, "Approval order must be at least 1"),
});

type CreateRuleFormData = z.infer<typeof createRuleSchema>;

function CreateApprovalRulePage() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const createRuleMutation = useCreateApprovalRule();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateRuleFormData>({
    resolver: zodResolver(createRuleSchema),
    defaultValues: {
      approverRole: ApproverRoleEnum.MANAGER,
      approvalOrder: 1,
      minAmount: 0,
    },
  });

  const onSubmit = (data: CreateRuleFormData) => {
    createRuleMutation.mutate(data);
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
        <h1 className="text-3xl font-bold text-foreground">Create Approval Rule</h1>
        <p className="text-muted-foreground mt-2">
          Define a new approval rule for expense workflows
        </p>
      </div>

      <Card className="bg-card border-border max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label htmlFor="categoryId" className="text-muted-foreground">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(value) => setValue("categoryId", value)}
            >
              <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories?.map((category) => (
                  <SelectItem key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="minAmount" className="text-muted-foreground">
              Minimum Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="minAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("minAmount", { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              This rule will apply to expenses with amounts equal to or greater than this value
            </p>
            {errors.minAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.minAmount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="approverRole" className="text-muted-foreground">
              Approver Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("approverRole")}
              onValueChange={(value) => setValue("approverRole", value as ApproverRoleEnum)}
            >
              <SelectTrigger className="mt-2 bg-muted border-border text-foreground">
                <SelectValue placeholder="Select approver role" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value={ApproverRoleEnum.STAFF}>Staff</SelectItem>
                <SelectItem value={ApproverRoleEnum.MANAGER}>Manager</SelectItem>
                <SelectItem value={ApproverRoleEnum.FINANCE}>Finance</SelectItem>
                <SelectItem value={ApproverRoleEnum.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Users with this role will be required to approve at this level
            </p>
            {errors.approverRole && (
              <p className="text-sm text-red-500 mt-1">{errors.approverRole.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="approvalOrder" className="text-muted-foreground">
              Approval Order <span className="text-red-500">*</span>
            </Label>
            <Input
              id="approvalOrder"
              type="number"
              min="1"
              placeholder="1"
              className="mt-2 bg-muted border-border text-foreground"
              {...register("approvalOrder", { valueAsNumber: true })}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Order in the approval chain (1 = first, 2 = second, etc.)
            </p>
            {errors.approvalOrder && (
              <p className="text-sm text-red-500 mt-1">{errors.approvalOrder.message}</p>
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
              disabled={createRuleMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default withAdminGuard(CreateApprovalRulePage, { title: "Create Approval Rule" });

