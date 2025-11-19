import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { getToken } from "@/lib/auth/token";

export function useAdminGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHasToken(null);
      setHasCheckedToken(true);
      return;
    }
    setHasToken(!!getToken());
    setHasCheckedToken(true);
  }, []);

  const normalizedRole =
    typeof user?.role === "string" ? user.role.toLowerCase() : undefined;
  const isAdmin = normalizedRole === "admin";

  useEffect(() => {
    if (!hasCheckedToken) {
      return;
    }

    if (isLoading) {
      return;
    }

    if (hasToken === false) {
      router.replace("/login");
      return;
    }

    if (hasToken && !user) {
      router.replace("/login");
      return;
    }

    if (user && !isAdmin) {
      router.replace("/");
    }
  }, [hasCheckedToken, hasToken, isLoading, isAdmin, user, router]);

  const guardLoading =
    isLoading || !hasCheckedToken || (hasToken === null) || (hasToken && !user);

  return { isAdmin, isLoading: guardLoading };
}
