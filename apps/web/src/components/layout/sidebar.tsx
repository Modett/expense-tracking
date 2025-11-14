"use client";

import { usePathname } from "next/navigation";
import { Home, Receipt, Plane, CheckCircle, Settings, Phone } from "lucide-react";
import { NavItem } from "./nav-item";
import { UserProfile } from "./user-profile";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/expenses", icon: Receipt, label: "Expenses" },
  { href: "/trips", icon: Plane, label: "Trips" },
  { href: "/approvals", icon: CheckCircle, label: "Approvals" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/support", icon: Phone, label: "Support" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-5 w-5 text-primary-foreground"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <span className="text-lg font-bold">Expensio</span>
          </div>
        </div>

        <div className="border-b">
          <UserProfile name="Janice Chandler" />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={pathname === item.href}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}
