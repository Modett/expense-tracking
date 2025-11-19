"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useChangePassword } from "@/features/auth/hooks/use-auth";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Please confirm the new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const changePassword = useChangePassword();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword.mutate(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast({
            title: "Password updated",
            description: "Your password has been changed successfully.",
          });
          form.reset({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        },
        onError: (error: any) => {
          toast({
            title: "Failed to change password",
            description: error.response?.data?.message || "Please try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Change Password</h1>
            <p className="text-muted-foreground mt-1">
              Update your account password securely.
            </p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to settings
            </Button>
          </Link>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-3 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm uppercase tracking-wide">
                Security
              </span>
            </div>
            <CardTitle className="text-foreground">Update password</CardTitle>
            <CardDescription>
              Enter your current password and choose a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          className="bg-muted border-border text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          className="bg-muted border-border text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Re-enter new password"
                          className="bg-muted border-border text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Password"
                  )}
                </Button>
              </form>
            </Form>

            {isSuccess && (
              <div className="mt-4 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">
                Password updated successfully. You can continue using Expensio
                with your new password.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

