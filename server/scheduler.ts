import cron from "node-cron";
import { storage } from "./storage";
import { HikConnectClient } from "./hik-connect-client";

export function startDeviceStatusScheduler() {
  // Run every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.log("[Scheduler] Checking device status...");
    
    try {
      const credentials = await storage.getHikConnectCredentials();
      if (!credentials) {
        console.log("[Scheduler] No credentials configured, skipping check");
        return;
      }

      const hikClient = new HikConnectClient(
        credentials.username,
        credentials.password,
        credentials.apiKey || undefined,
        credentials.apiSecret || undefined
      );

      const devices = await storage.getDevices();
      let checkedCount = 0;
      let statusChanges = 0;

      for (const device of devices) {
        try {
          const status = await hikClient.checkDeviceStatus(device.hikDeviceId);
          const newStatus = status === 1 ? "online" : "offline";
          
          if (device.status !== newStatus) {
            await storage.updateDeviceStatus(device.id, newStatus);
            await storage.createStatusHistory({
              deviceId: device.id,
              status: newStatus,
            });
            statusChanges++;
            console.log(`[Scheduler] Device ${device.name} status changed: ${device.status} → ${newStatus}`);
          }
          checkedCount++;
        } catch (error) {
          console.error(`[Scheduler] Failed to check device ${device.name}:`, error);
        }
      }

      await storage.updateLastSync(credentials.id);
      console.log(`[Scheduler] Checked ${checkedCount} devices, ${statusChanges} status changes`);
    } catch (error) {
      console.error("[Scheduler] Device status check failed:", error);
    }
  });

  console.log("[Scheduler] Device status scheduler started (runs every 15 minutes)");
}
