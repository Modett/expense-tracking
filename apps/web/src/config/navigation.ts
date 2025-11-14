import {
  LayoutDashboard,
  Receipt,
  CheckSquare,
  Wallet,
  Settings,
  BarChart3,
  FileText,
  Bell,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  description?: string;
  roles?: string[];
}

export const mainNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview of your expenses",
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: Receipt,
    description: "Manage your expenses",
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: CheckSquare,
    description: "Approve or reject expenses",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: Wallet,
    description: "Track your budgets",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "View analytics and reports",
  },
  {
    title: "Audit",
    href: "/audit",
    icon: FileText,
    description: "View audit logs",
    roles: ["ADMIN"],
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    description: "View notifications",
  },
];

export const settingsNavigation: NavItem[] = [
  {
    title: "Categories",
    href: "/settings/categories",
    icon: Settings,
  },
  {
    title: "Departments",
    href: "/settings/departments",
    icon: Settings,
  },
  {
    title: "Tags",
    href: "/settings/tags",
    icon: Settings,
  },
  {
    title: "Approval Rules",
    href: "/settings/rules",
    icon: Settings,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Users",
    href: "/settings/users",
    icon: Settings,
    roles: ["ADMIN"],
  },
];
