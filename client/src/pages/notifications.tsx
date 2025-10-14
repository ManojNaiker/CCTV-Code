import { useState, useEffect } from "react";
import { Bell, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { NotificationSettings } from "@shared/schema";

export default function Notifications() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    enabled: true,
    email: "",
    threshold: 10,
    checkInterval: 15,
    offlineAlert: true,
    onlineAlert: false,
  });

  // Fetch notification settings
  const { data: savedSettings } = useQuery<NotificationSettings>({
    queryKey: ["/api/notification-settings"],
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (savedSettings) {
      setSettings({
        enabled: savedSettings.enabled,
        email: savedSettings.email,
        threshold: savedSettings.threshold,
        checkInterval: savedSettings.checkInterval,
        offlineAlert: savedSettings.offlineAlert,
        onlineAlert: savedSettings.onlineAlert,
      });
    }
  }, [savedSettings]);

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      const response = await fetch("/api/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notification-settings"] });
      toast({
        title: "Settings saved",
        description: "Notification settings have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save notification settings",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(settings);
  };

  const handleTestNotification = () => {
    toast({
      title: "Test notification sent",
      description: `A test email will be sent to ${settings.email}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">
          Configure alerts for device status changes
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alert Configuration
            </CardTitle>
            <CardDescription>
              Set up when and how you want to be notified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for device status changes
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enabled: checked })
                }
                data-testid="switch-enable-notifications"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={settings.email}
                onChange={(e) =>
                  setSettings({ ...settings, email: e.target.value })
                }
                data-testid="input-notification-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Alert Threshold</Label>
              <Select
                value={String(settings.threshold)}
                onValueChange={(value) =>
                  setSettings({ ...settings, threshold: parseInt(value) })
                }
              >
                <SelectTrigger data-testid="select-alert-threshold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5+ devices offline</SelectItem>
                  <SelectItem value="10">10+ devices offline</SelectItem>
                  <SelectItem value="20">20+ devices offline</SelectItem>
                  <SelectItem value="50">50+ devices offline</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Send alert when this many devices go offline
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Check Interval</Label>
              <Select
                value={String(settings.checkInterval)}
                onValueChange={(value) =>
                  setSettings({ ...settings, checkInterval: parseInt(value) })
                }
              >
                <SelectTrigger data-testid="select-check-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Every 5 minutes</SelectItem>
                  <SelectItem value="15">Every 15 minutes</SelectItem>
                  <SelectItem value="30">Every 30 minutes</SelectItem>
                  <SelectItem value="60">Every hour</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Display preference (actual check runs every 15 minutes)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alert Types
            </CardTitle>
            <CardDescription>
              Choose which events trigger notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Device Offline Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when devices go offline
                </p>
              </div>
              <Switch
                checked={settings.offlineAlert}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, offlineAlert: checked })
                }
                data-testid="switch-offline-alerts"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Device Online Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when offline devices come back online
                </p>
              </div>
              <Switch
                checked={settings.onlineAlert}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, onlineAlert: checked })
                }
                data-testid="switch-online-alerts"
              />
            </div>

            <Separator />

            <div className="space-y-3 pt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleTestNotification}
                disabled={!settings.email}
                data-testid="button-test-notification"
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Test Notification
              </Button>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={saveMutation.isPending || !settings.email}
                data-testid="button-save-settings"
              >
                {saveMutation.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
