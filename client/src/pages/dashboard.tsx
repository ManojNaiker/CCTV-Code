import { useState } from "react";
import { Activity, Wifi, WifiOff, Clock } from "lucide-react";
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

//todo: remove mock functionality
const mockDevices = [
  {
    id: "1",
    name: "Camera-MH-001",
    branch: "Mumbai HQ",
    state: "Maharashtra",
    ip: "192.168.1.101",
    status: "online" as const,
    lastSeen: "2 min ago",
  },
  {
    id: "2",
    name: "Camera-DL-045",
    branch: "Delhi Office",
    state: "Delhi",
    ip: "192.168.2.045",
    status: "offline" as const,
    lastSeen: "15 min ago",
  },
  {
    id: "3",
    name: "Camera-KA-023",
    branch: "Bangalore Branch",
    state: "Karnataka",
    ip: "192.168.3.023",
    status: "online" as const,
    lastSeen: "1 min ago",
  },
  {
    id: "4",
    name: "Camera-TN-067",
    branch: "Chennai Office",
    state: "Tamil Nadu",
    ip: "192.168.4.067",
    status: "online" as const,
    lastSeen: "3 min ago",
  },
  {
    id: "5",
    name: "Camera-GJ-012",
    branch: "Ahmedabad Branch",
    state: "Gujarat",
    ip: "192.168.5.012",
    status: "offline" as const,
    lastSeen: "45 min ago",
  },
];

export default function Dashboard() {
  const [selectedState, setSelectedState] = useState<string>("all");

  //todo: remove mock functionality
  const totalDevices = 234;
  const onlineDevices = 198;
  const offlineDevices = 36;

  const statusData = [
    { name: "Online", value: onlineDevices },
    { name: "Offline", value: offlineDevices },
  ];

  const stateWiseData = [
    { state: "Maharashtra", online: 45, offline: 8 },
    { state: "Delhi", online: 32, offline: 5 },
    { state: "Karnataka", online: 38, offline: 7 },
    { state: "Tamil Nadu", online: 28, offline: 6 },
    { state: "Gujarat", online: 25, offline: 4 },
    { state: "Rajasthan", online: 30, offline: 6 },
  ];

  const filteredDevices =
    selectedState === "all"
      ? mockDevices
      : mockDevices.filter((device) => device.state === selectedState);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Device Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor all Hik-Connect devices in real-time
          </p>
        </div>
        <Button data-testid="button-refresh">
          <Activity className="mr-2 h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Devices"
          value={totalDevices}
          icon={Activity}
          accentColor="primary"
          testId="metric-total-devices"
        />
        <MetricCard
          title="Online Devices"
          value={onlineDevices}
          icon={Wifi}
          accentColor="online"
          testId="metric-online-devices"
        />
        <MetricCard
          title="Offline Devices"
          value={offlineDevices}
          icon={WifiOff}
          accentColor="offline"
          testId="metric-offline-devices"
        />
        <MetricCard
          title="Last Checked"
          value="2m ago"
          icon={Clock}
          accentColor="neutral"
          subtitle="Auto-refresh in 13m"
          testId="metric-last-checked"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DeviceStatusChart data={statusData} />
        <StateWiseChart data={stateWiseData} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Device List</h2>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[200px]" data-testid="select-state-filter">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Karnataka">Karnataka</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              <SelectItem value="Gujarat">Gujarat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>State</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Last Seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id} data-testid={`row-device-${device.id}`}>
                  <TableCell>
                    <StatusIndicator
                      status={device.status}
                      showLabel={false}
                      testId={`status-${device.id}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.branch}</TableCell>
                  <TableCell>{device.state}</TableCell>
                  <TableCell className="font-mono text-sm">{device.ip}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {device.lastSeen}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
