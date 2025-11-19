"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsDepartmentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/departments");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 p-6 flex items-center justify-center">
      <p className="text-zinc-400">Redirecting to Departments...</p>
    </div>
  );
}
