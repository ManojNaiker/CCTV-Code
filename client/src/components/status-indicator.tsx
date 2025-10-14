import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "offline" | "checking";
  showLabel?: boolean;
  size?: "sm" | "md";
  testId?: string;
}

export function StatusIndicator({
  status,
  showLabel = true,
  size = "md",
  testId,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
  };

  const statusConfig = {
    online: {
      color: "bg-chart-2",
      label: "Online",
      animation: "",
    },
    offline: {
      color: "bg-chart-3",
      label: "Offline",
      animation: "",
    },
    checking: {
      color: "bg-chart-1",
      label: "Checking...",
      animation: "animate-pulse",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2" data-testid={testId}>
      <div
        className={cn(
          "rounded-full",
          sizeClasses[size],
          config.color,
          config.animation
        )}
      />
      {showLabel && (
        <span className="text-sm font-medium">{config.label}</span>
      )}
    </div>
  );
}
