import { StatusIndicator } from "../status-indicator";

export default function StatusIndicatorExample() {
  return (
    <div className="p-4 space-y-4">
      <StatusIndicator status="online" />
      <StatusIndicator status="offline" />
      <StatusIndicator status="checking" />
    </div>
  );
}
