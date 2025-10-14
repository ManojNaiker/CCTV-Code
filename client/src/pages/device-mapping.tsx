import { useState } from "react";
import { Search, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusIndicator } from "@/components/status-indicator";

//todo: remove mock functionality
const mockDevices = [
  { id: "1", name: "Camera-MH-001", serial: "DS-2CD2085FWD-I", status: "online" as const, branch: "Mumbai HQ" },
  { id: "2", name: "Camera-DL-045", serial: "DS-2CD2145FWD-I", status: "offline" as const, branch: null },
  { id: "3", name: "Camera-KA-023", serial: "DS-2CD2385FWD-I", status: "online" as const, branch: "Bangalore Branch" },
  { id: "4", name: "Camera-TN-067", serial: "DS-2CD2685FWD-I", status: "online" as const, branch: null },
  { id: "5", name: "Camera-GJ-012", serial: "DS-2CD2485FWD-I", status: "offline" as const, branch: null },
  { id: "6", name: "Camera-RJ-089", serial: "DS-2CD2785FWD-I", status: "online" as const, branch: null },
];

const mockBranches = [
  { id: "1", name: "Mumbai HQ", state: "Maharashtra" },
  { id: "2", name: "Delhi Office", state: "Delhi" },
  { id: "3", name: "Bangalore Branch", state: "Karnataka" },
];

export default function DeviceMapping() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  const filteredDevices = mockDevices.filter((device) =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.serial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeviceToggle = (deviceId: string) => {
    setSelectedDevices((prev) =>
      prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId]
    );
  };

  const handleMapDevices = () => {
    console.log("Mapping devices:", selectedDevices, "to branch:", selectedBranch);
    setSelectedDevices([]);
    setSelectedBranch("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Device Mapping</h1>
        <p className="text-muted-foreground">
          Map devices to branch locations for organized monitoring
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Devices</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-devices"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredDevices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center space-x-3 rounded-md border p-3 hover-elevate"
                  data-testid={`device-item-${device.id}`}
                >
                  <Checkbox
                    id={device.id}
                    checked={selectedDevices.includes(device.id)}
                    onCheckedChange={() => handleDeviceToggle(device.id)}
                    data-testid={`checkbox-device-${device.id}`}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={device.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {device.name}
                    </Label>
                    <p className="text-xs text-muted-foreground font-mono">
                      {device.serial}
                    </p>
                    {device.branch && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Mapped to: {device.branch}
                      </p>
                    )}
                  </div>
                  <StatusIndicator status={device.status} showLabel={false} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Map to Branch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger data-testid="select-target-branch">
                  <SelectValue placeholder="Choose a branch" />
                </SelectTrigger>
                <SelectContent>
                  {mockBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name} ({branch.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border p-4 space-y-2">
              <h3 className="text-sm font-medium">Selected Devices</h3>
              <p className="text-2xl font-bold" data-testid="text-selected-count">
                {selectedDevices.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedDevices.length === 0
                  ? "No devices selected"
                  : `${selectedDevices.length} device${selectedDevices.length > 1 ? "s" : ""} ready to map`}
              </p>
            </div>

            <Button
              className="w-full"
              disabled={selectedDevices.length === 0 || !selectedBranch}
              onClick={handleMapDevices}
              data-testid="button-map-devices"
            >
              <LinkIcon className="mr-2 h-4 w-4" />
              Map Selected Devices
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
