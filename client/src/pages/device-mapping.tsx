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
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Device, Branch } from "@shared/schema";

export default function DeviceMapping() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("");

  // Fetch devices
  const { data: devices = [], isLoading: devicesLoading } = useQuery<Device[]>({
    queryKey: ["/api/devices"],
  });

  // Fetch branches
  const { data: branches = [], isLoading: branchesLoading } = useQuery<Branch[]>({
    queryKey: ["/api/branches"],
  });

  // Map devices mutation
  const mapDevicesMutation = useMutation({
    mutationFn: async ({ deviceIds, branchId }: { deviceIds: string[]; branchId: string }) => {
      const promises = deviceIds.map((deviceId) =>
        fetch(`/api/devices/${deviceId}/branch`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branchId }),
        })
      );
      const responses = await Promise.all(promises);
      const failedResponses = responses.filter((r) => !r.ok);
      if (failedResponses.length > 0) {
        throw new Error(`Failed to map ${failedResponses.length} devices`);
      }
      return { count: deviceIds.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      setSelectedDevices([]);
      setSelectedBranch("");
      toast({
        title: "Devices mapped",
        description: `Successfully mapped ${data.count} device${data.count > 1 ? "s" : ""} to branch.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Mapping failed",
        description: error.message || "Failed to map devices",
        variant: "destructive",
      });
    },
  });

  const filteredDevices = devices.filter((device) =>
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
    if (selectedDevices.length > 0 && selectedBranch) {
      mapDevicesMutation.mutate({
        deviceIds: selectedDevices,
        branchId: selectedBranch,
      });
    }
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return null;
    const branch = branches.find((b) => b.id === branchId);
    return branch?.name || null;
  };

  if (devicesLoading || branchesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Device Mapping</h1>
        <p className="text-muted-foreground">
          Map devices to branch locations for organized monitoring
        </p>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No devices found. Please sync devices from Hik-Connect Settings first.
            </p>
          </CardContent>
        </Card>
      ) : (
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
                {filteredDevices.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No devices match your search
                  </p>
                ) : (
                  filteredDevices.map((device) => (
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
                        {device.branchId && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Mapped to: {getBranchName(device.branchId)}
                          </p>
                        )}
                      </div>
                      <StatusIndicator
                        status={device.status as "online" | "offline" | "checking"}
                        showLabel={false}
                      />
                    </div>
                  ))
                )}
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
                {branches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No branches available. Create branches first.
                  </p>
                ) : (
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger data-testid="select-target-branch">
                      <SelectValue placeholder="Choose a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} ({branch.state})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
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
                disabled={
                  selectedDevices.length === 0 ||
                  !selectedBranch ||
                  mapDevicesMutation.isPending
                }
                onClick={handleMapDevices}
                data-testid="button-map-devices"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                {mapDevicesMutation.isPending
                  ? "Mapping..."
                  : "Map Selected Devices"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
