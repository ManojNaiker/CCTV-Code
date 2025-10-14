import { useState } from "react";
import { Key, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function HikConnectSettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    apiKey: "",
    apiSecret: "",
  });

  // Fetch existing credentials
  const { data: credentials, isLoading } = useQuery({
    queryKey: ["/api/hik-connect/credentials"],
  });

  // Save credentials mutation
  const saveCredentialsMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/hik-connect/credentials", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to save credentials");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hik-connect/credentials"] });
      toast({
        title: "Credentials saved",
        description: "Hik-Connect credentials have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save credentials",
        variant: "destructive",
      });
    },
  });

  // Sync devices mutation
  const syncDevicesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/hik-connect/sync", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to sync devices");
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devices"] });
      toast({
        title: "Devices synced",
        description: `Successfully synced ${data.count || 0} devices from Hik-Connect.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync failed",
        description: error.message || "Failed to sync devices from Hik-Connect",
        variant: "destructive",
      });
    },
  });

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveCredentialsMutation.mutate(formData);
  };

  const handleSyncDevices = () => {
    syncDevicesMutation.mutate();
  };

  // Populate form if credentials exist
  if (credentials && !formData.username && typeof credentials === 'object' && 'username' in credentials) {
    setFormData({
      username: credentials.username || "",
      password: "", // Don't populate password for security
      apiKey: credentials.apiKey || "",
      apiSecret: "", // Don't populate secret for security
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hik-Connect Settings</h1>
        <p className="text-muted-foreground">
          Configure your Hik-Connect portal credentials to fetch device data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Portal Credentials
            </CardTitle>
            <CardDescription>
              Enter your Hik-Connect portal login credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Email</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="your-username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  data-testid="input-hik-username"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  data-testid="input-hik-password"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key (Optional)</Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Your API Key"
                  value={formData.apiKey}
                  onChange={(e) =>
                    setFormData({ ...formData, apiKey: e.target.value })
                  }
                  data-testid="input-hik-apikey"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  For advanced API access (obtain from Hik-Connect developer portal)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiSecret">API Secret (Optional)</Label>
                <Input
                  id="apiSecret"
                  type="password"
                  placeholder="Your API Secret"
                  value={formData.apiSecret}
                  onChange={(e) =>
                    setFormData({ ...formData, apiSecret: e.target.value })
                  }
                  data-testid="input-hik-apisecret"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={saveCredentialsMutation.isPending || isLoading}
                data-testid="button-save-credentials"
              >
                {saveCredentialsMutation.isPending ? "Saving..." : "Save Credentials"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Device Synchronization
            </CardTitle>
            <CardDescription>
              Sync devices from your Hik-Connect portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md border p-4 space-y-2">
              <div className="flex items-center gap-2">
                {credentials ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-chart-2" />
                    <span className="text-sm font-medium">Credentials configured</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-chart-3" />
                    <span className="text-sm font-medium">No credentials configured</span>
                  </>
                )}
              </div>
              {credentials && typeof credentials === 'object' && 'lastSync' in credentials && credentials.lastSync && (
                <p className="text-xs text-muted-foreground">
                  Last synced: {new Date(credentials.lastSync).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleSyncDevices}
                disabled={!credentials || syncDevicesMutation.isPending}
                data-testid="button-sync-devices"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {syncDevicesMutation.isPending ? "Syncing..." : "Sync Devices Now"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This will fetch all devices from your Hik-Connect portal and update the local database
              </p>
            </div>

            <div className="rounded-md bg-muted p-4">
              <h4 className="text-sm font-medium mb-2">How it works:</h4>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Save your Hik-Connect portal credentials above</li>
                <li>Click "Sync Devices Now" to fetch device list</li>
                <li>Devices will be automatically checked every 15 minutes</li>
                <li>View real-time status on the Dashboard</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
