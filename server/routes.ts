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

      const hikDevices = await hikClient.getDevices();
      let syncedCount = 0;

      for (const hikDevice of hikDevices) {
        const existingDevice = await storage.getDeviceByHikId(hikDevice.deviceId);
        
        if (existingDevice) {
          await storage.updateDevice(existingDevice.id, {
            name: hikDevice.deviceName,
            serial: hikDevice.deviceSerial,
            type: hikDevice.deviceType,
            version: hikDevice.version,
            status: hikDevice.status === 1 ? "online" : "offline",
            lastSeen: new Date(),
          });
        } else {
          await storage.createDevice({
            hikDeviceId: hikDevice.deviceId,
            name: hikDevice.deviceName,
            serial: hikDevice.deviceSerial,
            type: hikDevice.deviceType,
            version: hikDevice.version,
            status: hikDevice.status === 1 ? "online" : "offline",
            lastSeen: new Date(),
          });
        }
        syncedCount++;
      }

      await storage.updateLastSync(credentials.id);

      res.json({ success: true, count: syncedCount });
    } catch (error: any) {
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

  const httpServer = createServer(app);

  return httpServer;
}
