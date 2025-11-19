"use client";

import { ComponentType } from "react";
import { useAdminGuard } from "@/hooks/use-admin-guard";

interface AdminGuardOptions {
  title?: string;
}

export function withAdminGuard<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
  options?: AdminGuardOptions
) {
  return function AdminGuardWrapper(props: P) {
    const { isAdmin, isLoading } = useAdminGuard();

    if (!isAdmin || isLoading) {
      return (
        <div className="p-8 bg-background min-h-screen">
          {options?.title ? (
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">
                {options.title}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isLoading ? "Loading..." : "Redirecting..."}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {isLoading ? "Loading..." : "Redirecting..."}
            </p>
          )}
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
