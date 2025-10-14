import { MetricCard } from "../metric-card";
import { Wifi } from "lucide-react";

export default function MetricCardExample() {
  return (
    <div className="p-4 space-y-4">
      <MetricCard
        title="Online Devices"
        value={198}
        icon={Wifi}
        accentColor="online"
        subtitle="84% uptime"
      />
    </div>
  );
}
