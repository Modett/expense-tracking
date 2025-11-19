"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/features/auth";
import { RoleEnum } from "@/types/common.types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  UserCog,
  Layers3,
  Building2,
  Tags,
  Users,
  ArrowRight,
  Pencil,
  LogOut,
} from "lucide-react";

type ManagementLink = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: RoleEnum[];
};

const managementLinks: ManagementLink[] = [
  {
    title: "Categories",
    description: "Create and manage spending categories.",
    href: "/settings/categories",
    icon: Layers3,
    roles: [RoleEnum.ADMIN, RoleEnum.MANAGER],
  },
  {
    title: "Departments",
    description: "Control department level budgets and access.",
    href: "/settings/departments",
    icon: Building2,
    roles: [RoleEnum.ADMIN],
  },
  {
    title: "Tags",
    description: "Define shared tags for expenses.",
    href: "/settings/tags",
    icon: Tags,
    roles: [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.FINANCE],
  },
  {
    title: "Approval Rules",
    description: "Design approval flows and thresholds.",
    href: "/settings/rules",
    icon: UserCog,
    roles: [RoleEnum.ADMIN, RoleEnum.MANAGER],
  },
  {
    title: "Users",
    description: "Invite teammates and assign roles.",
    href: "/settings/users",
    icon: Users,
    roles: [RoleEnum.ADMIN],
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const normalizedRole = user?.role?.toLowerCase() as RoleEnum | undefined;
  const isAdmin = normalizedRole === RoleEnum.ADMIN;

  const availableLinks = useMemo(() => {
    if (!isAdmin) return [];
    return managementLinks;
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400 mt-1">
            Manage your account preferences and workspace configuration.
          </p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-white text-xl">Profile</CardTitle>
              <CardDescription className="text-zinc-400">
                View and edit your account details
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-4 lg:mt-0">
              <Link href="/settings/edit-profile">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-zinc-500">Full Name</p>
              <p className="text-lg text-white font-medium">
                {user?.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Email</p>
              <p className="text-lg text-white font-medium">
                {user?.email || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Role</p>
              <p className="capitalize text-white font-medium">
                {normalizedRole || "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
                Security
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Update your password to keep your account safe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/settings/change-password">
                  Change password
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LogOut className="h-5 w-5 text-pink-400" />
                Session
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Need to switch accounts? Sign out from here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {availableLinks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-white">
              Workspace configuration
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {availableLinks.map((link) => (
                <Card
                  key={link.href}
                  className="bg-zinc-900 border-zinc-800 hover:border-cyan-500/40 transition-colors"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <link.icon className="h-5 w-5 text-cyan-400" />
                      {link.title}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {link.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="ghost" className="text-cyan-400 px-0">
                      <Link href={link.href}>
                        Manage {link.title.toLowerCase()}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {availableLinks.length === 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Nothing to configure</CardTitle>
              <CardDescription className="text-zinc-400">
                You can always update your password from this page. Contact an
                administrator if you need extended permissions.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  );
}
