import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "default" | "secondary" | "outline";
  iconColor?: string;
  iconBgColor?: string;
  className?: string;
}

export function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "outline",
  iconColor = "text-white",
  iconBgColor = "bg-primary",
  className,
}: QuickActionButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={cn("flex items-center gap-3 h-auto py-4 px-6 justify-start", className)}
    >
      <div className={cn("rounded-lg p-2.5", iconBgColor)}>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
}
