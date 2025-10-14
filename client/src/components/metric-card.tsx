import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accentColor?: "online" | "offline" | "primary" | "neutral";
  subtitle?: string;
  testId?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  accentColor = "neutral",
  subtitle,
  testId,
}: MetricCardProps) {
  const accentClasses = {
    online: "border-l-[3px] border-l-chart-2",
    offline: "border-l-[3px] border-l-chart-3",
    primary: "border-l-[3px] border-l-chart-1",
    neutral: "border-l-[3px] border-l-muted-foreground",
  };

  return (
    <Card className={cn(accentClasses[accentColor])} data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid={`${testId}-value`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
