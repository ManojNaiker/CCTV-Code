import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Hik-Connect credentials
export const hikConnectCredentials = pgTable("hik_connect_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  password: text("password").notNull(),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHikConnectCredentialsSchema = createInsertSchema(hikConnectCredentials).omit({
  id: true,
  createdAt: true,
});

export type InsertHikConnectCredentials = z.infer<typeof insertHikConnectCredentialsSchema>;
export type HikConnectCredentials = typeof hikConnectCredentials.$inferSelect;

// Branches
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  state: text("state").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
});

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type Branch = typeof branches.$inferSelect;

// Devices from Hik-Connect
export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hikDeviceId: text("hik_device_id").notNull().unique(),
  name: text("name").notNull(),
  serial: text("serial").notNull(),
  type: text("type"),
  version: text("version"),
  ipAddress: text("ip_address"),
  status: text("status").notNull().default("unknown"),
  lastSeen: timestamp("last_seen"),
  branchId: varchar("branch_id").references(() => branches.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;

// Device status history
export const deviceStatusHistory = pgTable("device_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id).notNull(),
  status: text("status").notNull(),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const insertDeviceStatusHistorySchema = createInsertSchema(deviceStatusHistory).omit({
  id: true,
  checkedAt: true,
});

export type InsertDeviceStatusHistory = z.infer<typeof insertDeviceStatusHistorySchema>;
export type DeviceStatusHistory = typeof deviceStatusHistory.$inferSelect;

// Notification settings
export const notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  enabled: boolean("enabled").notNull().default(true),
  email: text("email").notNull(),
  threshold: integer("threshold").notNull().default(10),
  checkInterval: integer("check_interval").notNull().default(15),
  offlineAlert: boolean("offline_alert").notNull().default(true),
  onlineAlert: boolean("online_alert").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
