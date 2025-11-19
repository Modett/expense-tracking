"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Receipt,
  Layers3,
  Building2,
  CheckCircle,
  Settings,
  Menu,
  X,
  LogOut,
  Wallet,
  Store,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useLogout } from "@/features/auth";
import { RoleEnum } from "@/types/common.types";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Budgets", href: "/budgets", icon: Wallet },
  { name: "Vendors", href: "/vendors", icon: Store },
  { name: "Categories", href: "/categories", icon: Layers3 },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Approvals", href: "/approvals", icon: CheckCircle },
  { name: "Approval Rules", href: "/approval-rules", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = useLogout();
  const normalizedRole =
    typeof user?.role === "string" ? user.role.toLowerCase() : undefined;
  const isAdmin = normalizedRole === RoleEnum.ADMIN;
  const adminOnlyLinks = new Set([
    "Budgets",
    "Vendors",
    "Categories",
    "Departments",
    "Approval Rules",
  ]);
  const visibleNavigation = navigation.filter((item) => {
    if (!isAdmin && adminOnlyLinks.has(item.name)) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/70 to-primary">
                <svg
                  className="h-6 w-6 text-foreground"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <div>
                <div className="text-foreground font-bold text-lg">
                  EX<span className="text-cyan-400">P</span>ensio
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {visibleNavigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-border p-4 space-y-3">
            {user && (
              <div className="flex items-center gap-3 px-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center text-foreground text-sm font-semibold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-3" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-foreground font-bold text-lg">
            EX<span className="text-cyan-400">P</span>ensio
          </div>
          <div className="w-10" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

