"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Receipt,
  Plane,
  CheckCircle,
  Settings,
  Phone,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Trips", href: "/trips", icon: Plane },
  { name: "Approvals", href: "/approvals", icon: CheckCircle },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Support", href: "/support", icon: Phone },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-950">
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600">
                <svg
                  className="h-6 w-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-lg">
                  EX<span className="text-cyan-400">P</span>ensio
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-zinc-400"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer branding */}
          <div className="border-t border-zinc-800 p-6">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse delay-75" />
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse delay-150" />
              </div>
              <span className="font-mono">EXPensio</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between h-16 px-4 border-b border-zinc-800 bg-zinc-950">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-white font-bold text-lg">
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
