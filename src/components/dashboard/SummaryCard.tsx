import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  value: string | ReactNode;
  description?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "error";
}

export function SummaryCard({
  title,
  value,
  description,
  icon,
  variant = "default",
}: SummaryCardProps) {
  return (
    <div className="border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p
            className={cn(
              "text-xl font-semibold",
              variant === "success" && "text-primary",
              variant === "warning" && "text-warning",
              variant === "error" && "text-destructive",
              variant === "default" && "text-foreground"
            )}
          >
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground">{icon}</div>
        )}
      </div>
    </div>
  );
}
