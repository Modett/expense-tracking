import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PendingTaskItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  iconBgColor?: string;
  onClick?: () => void;
  className?: string;
}

export function PendingTaskItem({
  icon: Icon,
  label,
  value,
  iconColor = "text-purple-500",
  iconBgColor = "bg-purple-500/10",
  onClick,
  className,
}: PendingTaskItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 transition-colors",
        onClick && "cursor-pointer hover:bg-accent/50 rounded-lg px-3 -mx-3",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn("rounded-lg p-2", iconBgColor)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
