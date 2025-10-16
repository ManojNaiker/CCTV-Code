import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { HikConnectClient } from "./hik-connect-client";
import {
  insertHikConnectCredentialsSchema,
  insertBranchSchema,
  insertNotificationSettingsSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Hik-Connect Credentials Routes
  app.get("/api/hik-connect/credentials", async (req, res) => {
    try {
      const credentials = await storage.getHikConnectCredentials();
      if (!credentials) {
        return res.status(404).json({ error: "No credentials configured" });
      }
      
      // Don't send password and apiSecret to client
      const { password, apiSecret, ...safeCredentials } = credentials;
      res.json(safeCredentials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch credentials" });
    }
  });

  app.post("/api/hik-connect/credentials", async (req, res) => {
    try {
      const validated = insertHikConnectCredentialsSchema.parse(req.body);
      const credentials = await storage.saveHikConnectCredentials(validated);
      
      const { password, apiSecret, ...safeCredentials } = credentials;
      res.json(safeCredentials);
    } catch (error) {
      res.status(400).json({ error: "Invalid credentials data" });
    }
  });

  // Sync devices from Hik-Connect
  app.post("/api/hik-connect/sync", async (req, res) => {
    try {
      console.log("\n[SYNC] ========== Device Sync Started ==========");
      console.log("[SYNC] Step 1: Fetching credentials from storage...");
      
      const credentials = await storage.getHikConnectCredentials();
      if (!credentials) {
        console.error("[SYNC] ERROR: No credentials found in storage");
        return res.status(400).json({ error: "No credentials configured" });
      }

      console.log("[SYNC] Credentials found:");
      console.log("[SYNC] - Username:", credentials.username);
      console.log("[SYNC] - Has API Key:", !!credentials.apiKey);
      console.log("[SYNC] - Has API Secret:", !!credentials.apiSecret);
      
      console.log("[SYNC] Step 2: Creating HikConnectClient...");
      const hikClient = new HikConnectClient(
        credentials.username,
        credentials.password,
        credentials.apiKey || undefined,
        credentials.apiSecret || undefined
      );
      console.log("[SYNC] HikConnectClient created successfully");

      console.log("[SYNC] Step 3: Fetching devices from Hik-Connect API...");
      const hikDevices = await hikClient.getDevices();
      console.log("[SYNC] Received", hikDevices.length, "devices from Hik-Connect");
      
      let syncedCount = 0;
      console.log("[SYNC] Step 4: Processing and saving devices to database...");

      for (const hikDevice of hikDevices) {
        console.log(`[SYNC] Processing device: ${hikDevice.deviceName} (${hikDevice.deviceId})`);
        
        const existingDevice = await storage.getDeviceByHikId(hikDevice.deviceId);
        
        if (existingDevice) {
          console.log(`[SYNC] - Device exists, updating: ${existingDevice.id}`);
          await storage.updateDevice(existingDevice.id, {
            name: hikDevice.deviceName,
            serial: hikDevice.deviceSerial,
            type: hikDevice.deviceType,
            version: hikDevice.version,
            status: hikDevice.status === 1 ? "online" : "offline",
            lastSeen: new Date(),
          });
          console.log(`[SYNC] - Device updated successfully`);
        } else {
          console.log(`[SYNC] - New device, creating in database...`);
          await storage.createDevice({
            hikDeviceId: hikDevice.deviceId,
            name: hikDevice.deviceName,
            serial: hikDevice.deviceSerial,
            type: hikDevice.deviceType,
            version: hikDevice.version,
            status: hikDevice.status === 1 ? "online" : "offline",
            lastSeen: new Date(),
          });
          console.log(`[SYNC] - Device created successfully`);
        }
        syncedCount++;
      }

      console.log("[SYNC] Step 5: Updating last sync timestamp...");
      await storage.updateLastSync(credentials.id);
      console.log("[SYNC] Last sync timestamp updated");

      console.log("[SYNC] ========== Sync Completed Successfully ==========");
      console.log(`[SYNC] Total devices synced: ${syncedCount}\n`);

      res.json({ success: true, count: syncedCount });
    } catch (error: any) {
      console.error("\n[SYNC] ========== Sync Failed ==========");
      console.error("[SYNC] Error type:", error.constructor.name);
      console.error("[SYNC] Error message:", error.message);
      console.error("[SYNC] Error stack:", error.stack);
      console.error("[SYNC] =====================================\n");
      
      res.status(500).json({ error: error.message || "Failed to sync devices" });
    }
  });

  // Devices Routes
  app.get("/api/devices", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  app.patch("/api/devices/:id/branch", async (req, res) => {
    try {
      const { id } = req.params;
      const { branchId } = req.body;
      
      const device = await storage.updateDevice(id, { branchId });
      res.json(device);
    } catch (error) {
      res.status(400).json({ error: "Failed to update device mapping" });
    }
  });

  // Branches Routes
  app.get("/api/branches", async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch branches" });
    }
  });

  app.post("/api/branches", async (req, res) => {
    try {
      const validated = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch(validated);
      res.json(branch);
    } catch (error) {
      res.status(400).json({ error: "Invalid branch data" });
    }
  });

  app.patch("/api/branches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validated = insertBranchSchema.partial().parse(req.body);
      const branch = await storage.updateBranch(id, validated);
      res.json(branch);
    } catch (error) {
      res.status(400).json({ error: "Failed to update branch" });
    }
  });

  app.delete("/api/branches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBranch(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete branch" });
    }
  });

  // Notification Settings Routes
  app.get("/api/notification-settings", async (req, res) => {
    try {
      const settings = await storage.getNotificationSettings();
      res.json(settings || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notification settings" });
    }
  });

  app.post("/api/notification-settings", async (req, res) => {
    try {
      const validated = insertNotificationSettingsSchema.parse(req.body);
      const settings = await storage.saveNotificationSettings(validated);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid notification settings" });
    }
  });

  // Device Status Check (manual trigger)
  app.post("/api/devices/check-status", async (req, res) => {
    try {
      const credentials = await storage.getHikConnectCredentials();
      if (!credentials) {
        return res.status(400).json({ error: "No credentials configured" });
      }

      const hikClient = new HikConnectClient(
        credentials.username,
        credentials.password,
        credentials.apiKey || undefined,
        credentials.apiSecret || undefined
      );

      const devices = await storage.getDevices();
      let checkedCount = 0;

      for (const device of devices) {
        const status = await hikClient.checkDeviceStatus(device.hikDeviceId);
        const newStatus = status === 1 ? "online" : "offline";
        
        if (device.status !== newStatus) {
          await storage.updateDeviceStatus(device.id, newStatus);
          await storage.createStatusHistory({
            deviceId: device.id,
            status: newStatus,
          });
        }
        checkedCount++;
      }

      res.json({ success: true, checked: checkedCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to check device status" });
    }
  });

  // Chart statistics endpoint
  app.get("/api/stats/chart-data", async (req, res) => {
    try {
      const devices = await storage.getDevices();
      const branches = await storage.getBranches();

      // Calculate overall status distribution
      const online = devices.filter(d => d.status === "online").length;
      const offline = devices.filter(d => d.status === "offline").length;
      const unknown = devices.filter(d => d.status === "unknown").length;

      // Calculate state-wise distribution
      const stateMap = new Map<string, { online: number; offline: number; unknown: number }>();
      
      devices.forEach((device) => {
        const branch = branches.find((b) => b.id === device.branchId);
        const state = branch?.state || "Unassigned";
        
        if (!stateMap.has(state)) {
          stateMap.set(state, { online: 0, offline: 0, unknown: 0 });
        }
        
        const stats = stateMap.get(state)!;
        if (device.status === "online") {
          stats.online++;
        } else if (device.status === "offline") {
          stats.offline++;
        } else {
          stats.unknown++;
        }
      });

      const stateWiseData = Array.from(stateMap.entries()).map(([state, stats]) => ({
        state,
        ...stats,
      }));

      res.json({
        deviceStatus: [
          { name: "Online", value: online },
          { name: "Offline", value: offline },
        ],
        stateWise: stateWiseData,
        summary: {
          total: devices.length,
          online,
          offline,
          unknown,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
