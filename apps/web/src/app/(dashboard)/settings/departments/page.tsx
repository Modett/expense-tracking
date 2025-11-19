"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withAdminGuard } from "@/hooks/with-admin-guard";

function SettingsDepartmentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/departments");
  }, [router]);

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Departments...</p>
    </div>
  );
}

export default withAdminGuard(SettingsDepartmentsPage, { title: "Departments" });

