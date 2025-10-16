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
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Hik-Connect Credentials
  getHikConnectCredentials(): Promise<HikConnectCredentials | undefined>;
  saveHikConnectCredentials(credentials: InsertHikConnectCredentials): Promise<HikConnectCredentials>;
  updateLastSync(id: string): Promise<void>;
  updateSession(id: string, sessionId: string, featureCode?: string, customNo?: string, sessionExpiry?: Date): Promise<void>;

  // Branches
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, branch: Partial<InsertBranch>): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;

  // Devices
  getDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  getDeviceByHikId(hikDeviceId: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, device: Partial<InsertDevice>): Promise<Device>;
  updateDeviceStatus(id: string, status: string): Promise<void>;
  deleteDevice(id: string): Promise<void>;

  // Device Status History
  createStatusHistory(history: InsertDeviceStatusHistory): Promise<DeviceStatusHistory>;
  getDeviceHistory(deviceId: string, limit?: number): Promise<DeviceStatusHistory[]>;

  // Notification Settings
  getNotificationSettings(): Promise<NotificationSettings | undefined>;
  saveNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings>;
}

export class MemStorage implements IStorage {
  private hikCredentials: HikConnectCredentials | undefined;
  private branches: Map<string, Branch>;
  private devices: Map<string, Device>;
  private statusHistory: DeviceStatusHistory[];
  private notificationSettings: NotificationSettings | undefined;

  constructor() {
    this.branches = new Map();
    this.devices = new Map();
    this.statusHistory = [];
  }

  // Hik-Connect Credentials
  async getHikConnectCredentials(): Promise<HikConnectCredentials | undefined> {
    return this.hikCredentials;
  }

  async saveHikConnectCredentials(credentials: InsertHikConnectCredentials): Promise<HikConnectCredentials> {
    const id = randomUUID();
    const hikCreds: HikConnectCredentials = {
      id,
      username: credentials.username,
      password: credentials.password,
      apiKey: credentials.apiKey ?? null,
      apiSecret: credentials.apiSecret ?? null,
      sessionId: credentials.sessionId ?? null,
      featureCode: credentials.featureCode ?? null,
      customNo: credentials.customNo ?? null,
      sessionExpiry: credentials.sessionExpiry ?? null,
      createdAt: new Date(),
      lastSync: null,
    };
    this.hikCredentials = hikCreds;
    return hikCreds;
  }

  async updateLastSync(id: string): Promise<void> {
    if (this.hikCredentials && this.hikCredentials.id === id) {
      this.hikCredentials.lastSync = new Date();
    }
  }

  async updateSession(id: string, sessionId: string, featureCode?: string, customNo?: string, sessionExpiry?: Date): Promise<void> {
    if (this.hikCredentials && this.hikCredentials.id === id) {
      this.hikCredentials.sessionId = sessionId;
      this.hikCredentials.featureCode = featureCode || null;
      this.hikCredentials.customNo = customNo || null;
      this.hikCredentials.sessionExpiry = sessionExpiry || null;
    }
  }

  // Branches
  async getBranches(): Promise<Branch[]> {
    return Array.from(this.branches.values());
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    return this.branches.get(id);
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const id = randomUUID();
    const branch: Branch = { ...insertBranch, id, createdAt: new Date() };
    this.branches.set(id, branch);
    return branch;
  }

  async updateBranch(id: string, updates: Partial<InsertBranch>): Promise<Branch> {
    const branch = this.branches.get(id);
    if (!branch) throw new Error("Branch not found");
    const updated = { ...branch, ...updates };
    this.branches.set(id, updated);
    return updated;
  }

  async deleteBranch(id: string): Promise<void> {
    this.branches.delete(id);
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async getDeviceByHikId(hikDeviceId: string): Promise<Device | undefined> {
    return Array.from(this.devices.values()).find(
      (device) => device.hikDeviceId === hikDeviceId
    );
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = randomUUID();
    const device: Device = {
      id,
      hikDeviceId: insertDevice.hikDeviceId,
      name: insertDevice.name,
      serial: insertDevice.serial,
      type: insertDevice.type ?? null,
      version: insertDevice.version ?? null,
      ipAddress: insertDevice.ipAddress ?? null,
      status: insertDevice.status ?? "unknown",
      lastSeen: insertDevice.lastSeen ?? null,
      branchId: insertDevice.branchId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.devices.set(id, device);
    return device;
  }

  async updateDevice(id: string, updates: Partial<InsertDevice>): Promise<Device> {
    const device = this.devices.get(id);
    if (!device) throw new Error("Device not found");
    const updated = { ...device, ...updates, updatedAt: new Date() };
    this.devices.set(id, updated);
    return updated;
  }

  async updateDeviceStatus(id: string, status: string): Promise<void> {
    const device = this.devices.get(id);
    if (device) {
      device.status = status;
      device.lastSeen = new Date();
      device.updatedAt = new Date();
    }
  }

  async deleteDevice(id: string): Promise<void> {
    this.devices.delete(id);
  }

  // Device Status History
  async createStatusHistory(insertHistory: InsertDeviceStatusHistory): Promise<DeviceStatusHistory> {
    const id = randomUUID();
    const history: DeviceStatusHistory = {
      ...insertHistory,
      id,
      checkedAt: new Date(),
    };
    this.statusHistory.push(history);
    return history;
  }

  async getDeviceHistory(deviceId: string, limit: number = 50): Promise<DeviceStatusHistory[]> {
    return this.statusHistory
      .filter((h) => h.deviceId === deviceId)
      .sort((a, b) => b.checkedAt.getTime() - a.checkedAt.getTime())
      .slice(0, limit);
  }

  // Notification Settings
  async getNotificationSettings(): Promise<NotificationSettings | undefined> {
    return this.notificationSettings;
  }

  async saveNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings> {
    const id = randomUUID();
    const notifSettings: NotificationSettings = {
      id,
      enabled: settings.enabled ?? true,
      email: settings.email,
      threshold: settings.threshold ?? 10,
      checkInterval: settings.checkInterval ?? 15,
      offlineAlert: settings.offlineAlert ?? true,
      onlineAlert: settings.onlineAlert ?? false,
      updatedAt: new Date(),
    };
    this.notificationSettings = notifSettings;
    return notifSettings;
  }
}

import { DbStorage } from "./db-storage";

// Use database storage for persistence
export const storage = process.env.DATABASE_URL ? new DbStorage() : new MemStorage();
