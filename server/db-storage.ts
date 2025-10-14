import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, desc } from "drizzle-orm";
import {
  type Branch,
  type InsertBranch,
  type Device,
  type InsertDevice,
  type HikConnectCredentials,
  type InsertHikConnectCredentials,
  type NotificationSettings,
  type InsertNotificationSettings,
  type DeviceStatusHistory,
  type InsertDeviceStatusHistory,
  branches,
  devices,
  hikConnectCredentials,
  notificationSettings,
  deviceStatusHistory,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DbStorage implements IStorage {
  private db;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    this.db = drizzle(pool);
  }

  // Hik-Connect Credentials
  async getHikConnectCredentials(): Promise<HikConnectCredentials | undefined> {
    const result = await this.db.select().from(hikConnectCredentials).limit(1);
    return result[0];
  }

  async saveHikConnectCredentials(credentials: InsertHikConnectCredentials): Promise<HikConnectCredentials> {
    // Delete existing credentials first (only one set allowed)
    await this.db.delete(hikConnectCredentials);
    
    const result = await this.db.insert(hikConnectCredentials).values(credentials).returning();
    return result[0];
  }

  async updateLastSync(id: string): Promise<void> {
    await this.db
      .update(hikConnectCredentials)
      .set({ lastSync: new Date() })
      .where(eq(hikConnectCredentials.id, id));
  }

  // Branches
  async getBranches(): Promise<Branch[]> {
    return await this.db.select().from(branches);
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    const result = await this.db.select().from(branches).where(eq(branches.id, id)).limit(1);
    return result[0];
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const result = await this.db.insert(branches).values(branch).returning();
    return result[0];
  }

  async updateBranch(id: string, updates: Partial<InsertBranch>): Promise<Branch> {
    const result = await this.db
      .update(branches)
      .set(updates)
      .where(eq(branches.id, id))
      .returning();
    return result[0];
  }

  async deleteBranch(id: string): Promise<void> {
    await this.db.delete(branches).where(eq(branches.id, id));
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    return await this.db.select().from(devices);
  }

  async getDevice(id: string): Promise<Device | undefined> {
    const result = await this.db.select().from(devices).where(eq(devices.id, id)).limit(1);
    return result[0];
  }

  async getDeviceByHikId(hikDeviceId: string): Promise<Device | undefined> {
    const result = await this.db
      .select()
      .from(devices)
      .where(eq(devices.hikDeviceId, hikDeviceId))
      .limit(1);
    return result[0];
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const result = await this.db.insert(devices).values(device).returning();
    return result[0];
  }

  async updateDevice(id: string, updates: Partial<InsertDevice>): Promise<Device> {
    const result = await this.db
      .update(devices)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return result[0];
  }

  async updateDeviceStatus(id: string, status: string): Promise<void> {
    await this.db
      .update(devices)
      .set({ 
        status, 
        lastSeen: new Date(),
        updatedAt: new Date()
      })
      .where(eq(devices.id, id));
  }

  async deleteDevice(id: string): Promise<void> {
    await this.db.delete(devices).where(eq(devices.id, id));
  }

  // Device Status History
  async createStatusHistory(history: InsertDeviceStatusHistory): Promise<DeviceStatusHistory> {
    const result = await this.db.insert(deviceStatusHistory).values(history).returning();
    return result[0];
  }

  async getDeviceHistory(deviceId: string, limit: number = 50): Promise<DeviceStatusHistory[]> {
    return await this.db
      .select()
      .from(deviceStatusHistory)
      .where(eq(deviceStatusHistory.deviceId, deviceId))
      .orderBy(desc(deviceStatusHistory.checkedAt))
      .limit(limit);
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings | undefined> {
    const result = await this.db.select().from(notificationSettings).limit(1);
    return result[0];
  }

  async saveNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings> {
    // Delete existing settings first (only one set allowed)
    await this.db.delete(notificationSettings);
    
    const result = await this.db.insert(notificationSettings).values(settings).returning();
    return result[0];
  }
}
