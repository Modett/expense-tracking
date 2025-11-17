"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import { useApprovalRule, useUpdateApprovalRule, ApproverRoleEnum } from "@/features/approval-rules";
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

const updateRuleSchema = z.object({
  minAmount: z.number().min(0, "Minimum amount must be 0 or greater"),
  approverRole: z.nativeEnum(ApproverRoleEnum),
  approvalOrder: z.number().min(1, "Approval order must be at least 1"),
});

type UpdateRuleFormData = z.infer<typeof updateRuleSchema>;

export default function EditApprovalRulePage() {
  const params = useParams();
  const router = useRouter();
  const ruleId = params.id as string;

  const { data: rule, isLoading } = useApprovalRule(ruleId);
  const updateRuleMutation = useUpdateApprovalRule();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UpdateRuleFormData>({
    resolver: zodResolver(updateRuleSchema),
  });

  useEffect(() => {
    if (rule) {
      reset({
        minAmount: Number(rule.minAmount),
        approverRole: rule.approverRole as ApproverRoleEnum,
        approvalOrder: rule.approvalOrder,
      });
    }
  }, [rule, reset]);

  const onSubmit = (data: UpdateRuleFormData) => {
    updateRuleMutation.mutate(
      { ruleId, data },
      {
        onSuccess: () => router.push("/approval-rules"),
      }
    );
  };

  if (isLoading || !rule) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Loading...</h1>
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
        <h1 className="text-3xl font-bold text-white">Edit Approval Rule</h1>
        <p className="text-zinc-400 mt-2">
          Update approval rule for {rule.category?.name}
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label className="text-zinc-300">Category</Label>
            <div className="mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white">
              {rule.category?.name || "Unknown"}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Category cannot be changed after creation
            </p>
          </div>

          <div>
            <Label htmlFor="minAmount" className="text-zinc-300">
              Minimum Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="minAmount"
              type="number"
              step="0.01"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              {...register("minAmount", { valueAsNumber: true })}
            />
            <p className="text-sm text-zinc-500 mt-1">
              This rule will apply to expenses with amounts equal to or greater than this value
            </p>
            {errors.minAmount && (
              <p className="text-sm text-red-500 mt-1">{errors.minAmount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="approverRole" className="text-zinc-300">
              Approver Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("approverRole")}
              onValueChange={(value) => setValue("approverRole", value as ApproverRoleEnum)}
            >
              <SelectTrigger className="mt-2 bg-zinc-800 border-zinc-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value={ApproverRoleEnum.STAFF}>Staff</SelectItem>
                <SelectItem value={ApproverRoleEnum.MANAGER}>Manager</SelectItem>
                <SelectItem value={ApproverRoleEnum.FINANCE}>Finance</SelectItem>
                <SelectItem value={ApproverRoleEnum.ADMIN}>Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.approverRole && (
              <p className="text-sm text-red-500 mt-1">{errors.approverRole.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="approvalOrder" className="text-zinc-300">
              Approval Order <span className="text-red-500">*</span>
            </Label>
            <Input
              id="approvalOrder"
              type="number"
              min="1"
              className="mt-2 bg-zinc-800 border-zinc-700 text-white"
              {...register("approvalOrder", { valueAsNumber: true })}
            />
            <p className="text-sm text-zinc-500 mt-1">
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
              className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateRuleMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              {updateRuleMutation.isPending ? "Updating..." : "Update Rule"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

