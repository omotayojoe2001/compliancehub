import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

interface AlertBannerProps {
  message: string;
  type?: "warning" | "error" | "info";
}

export function AlertBanner({ message, type = "warning" }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between border border-warning/20 bg-warning/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <p className="text-sm font-medium text-foreground">{message}</p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
