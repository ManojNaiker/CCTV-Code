import { useState, useMemo } from "react";
import { Activity, Wifi, WifiOff, Clock, RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { StatusIndicator } from "@/components/status-indicator";
import { DeviceStatusChart } from "@/components/device-status-chart";
import { StateWiseChart } from "@/components/state-wise-chart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Device, Branch } from "@shared/schema";

export default function Dashboard() {
  const [selectedState, setSelectedState] = useState<string>("all");
  const { toast } = useToast();

  // Fetch devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  // Fetch branches
  const { data: branches = [] } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  // Manual status check mutation
  const checkStatusMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/devices/check-status", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to check device status");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Status updated",
        description: `Checked ${data.checked} devices successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Check failed",
        description: error.message || "Failed to check device status",
        variant: "destructive",
      });
    },
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = devices.length;
    const online = devices.filter((d) => d.status === "online").length;
    const offline = devices.filter((d) => d.status === "offline").length;
    return { total, online, offline };
  }, [devices]);

  // Prepare chart data
  const statusData = [
    { name: "Online", value: metrics.online },
    { name: "Offline", value: metrics.offline },
  ];

  // Calculate state-wise data
  const stateWiseData = useMemo(() => {
    const stateMap = new Map<string, { online: number; offline: number }>();
    
    devices.forEach((device) => {
      const branch = branches.find((b) => b.id === device.branchId);
      const state = branch?.state || "Unassigned";
      
      if (!stateMap.has(state)) {
        stateMap.set(state, { online: 0, offline: 0 });
      }
      
      const stats = stateMap.get(state)!;
      if (device.status === "online") {
        stats.online++;
      } else if (device.status === "offline") {
        stats.offline++;
      }
    });

    return Array.from(stateMap.entries()).map(([state, stats]) => ({
      state,
      ...stats,
    }));
  }, [devices, branches]);

  // Get unique states for filter
  const states = useMemo(() => {
    const stateSet = new Set<string>();
    branches.forEach((b) => stateSet.add(b.state));
    return Array.from(stateSet).sort();
  }, [branches]);

  // Filter devices
  const filteredDevices = useMemo(() => {
    if (selectedState === "all") return devices;
    
    const stateBranches = branches
      .filter((b) => b.state === selectedState)
      .map((b) => b.id);
    
    return devices.filter((d) => d.branchId && stateBranches.includes(d.branchId));
  }, [devices, branches, selectedState]);

  // Get branch name for device
  const getBranchName = (branchId: string | null) => {
    if (!branchId) return "Unassigned";
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || "Unknown";
  };

  // Get branch state for device
  const getBranchState = (branchId: string | null) => {
    if (!branchId) return "—";
    const branch = branches.find((b) => b.id === branchId);
    return branch?.state || "—";
  };

  // Format last seen
  const formatLastSeen = (lastSeen: Date | null) => {
    if (!lastSeen) return "Never";
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (devicesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Device Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor all Hik-Connect devices in real-time
          </p>
        </div>
        <Button
          onClick={() => checkStatusMutation.mutate()}
          disabled={checkStatusMutation.isPending}
          data-testid="button-refresh"
        >
          <Activity className="mr-2 h-4 w-4" />
          {checkStatusMutation.isPending ? "Checking..." : "Check Status Now"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Devices"
          value={metrics.total}
          icon={Activity}
          accentColor="primary"
          testId="metric-total-devices"
        />
        <MetricCard
          title="Online Devices"
          value={metrics.online}
          icon={Wifi}
          accentColor="online"
          subtitle={`${metrics.total > 0 ? Math.round((metrics.online / metrics.total) * 100) : 0}% uptime`}
          testId="metric-online-devices"
        />
        <MetricCard
          title="Offline Devices"
          value={metrics.offline}
          icon={WifiOff}
          accentColor="offline"
          testId="metric-offline-devices"
        />
        <MetricCard
          title="Auto-Check"
          value="Every 15m"
          icon={Clock}
          accentColor="neutral"
          subtitle="Automated monitoring"
          testId="metric-last-checked"
        />
      </div>

      {metrics.total > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <DeviceStatusChart data={statusData} />
          <StateWiseChart data={stateWiseData} />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Device List</h2>
          {states.length > 0 && (
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[200px]" data-testid="select-state-filter">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {filteredDevices.length === 0 ? (
          <div className="border rounded-md p-8 text-center">
            <p className="text-muted-foreground">
              No devices found. Please sync devices from Hik-Connect Settings.
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Device Name</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((device) => (
                  <TableRow key={device.id} data-testid={`row-device-${device.id}`}>
                    <TableCell>
                      <StatusIndicator
                        status={device.status as "online" | "offline" | "checking"}
                        showLabel={false}
                        testId={`status-${device.id}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{getBranchName(device.branchId)}</TableCell>
                    <TableCell>{getBranchState(device.branchId)}</TableCell>
                    <TableCell className="font-mono text-sm">{device.serial}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatLastSeen(device.lastSeen)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
