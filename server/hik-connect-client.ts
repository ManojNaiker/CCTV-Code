import axios, { AxiosInstance } from "axios";
import crypto from "crypto";

interface HikConnectDevice {
  deviceId: string;
  deviceName: string;
  deviceSerial: string;
  deviceType?: string;
  version?: string;
  status?: number; // 1 = online, 0 = offline
}

interface LoginResponse {
  sessionId: string;
  featureCode?: string;
  customNo?: string;
  expiry?: number;
}

export class HikConnectClient {
  private axios: AxiosInstance;
  private username: string;
  private password: string;
  private sessionId?: string;
  private featureCode?: string;
  private customNo?: string;
  private sessionExpiry?: Date;

  constructor(
    username: string, 
    password: string, 
    sessionId?: string, 
    featureCode?: string, 
    customNo?: string,
    sessionExpiry?: Date
  ) {
    this.username = username;
    this.password = password;
    this.sessionId = sessionId;
    this.featureCode = featureCode;
    this.customNo = customNo;
    this.sessionExpiry = sessionExpiry;

    this.axios = axios.create({
      baseURL: "https://www.hik-connect.com",
      timeout: 30000,
      headers: {
        'accept': 'application/json, text/plain, */*',
        'clientsource': '0',
        'clienttype': '48',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      }
    });
  }

  private encryptPassword(password: string): string {
    const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCVqbZMqZaOJWBwptMWCBQ6JdB0
nOQa5Qwqx0Z9zxOUZpIqPwrLqzLlSB2gPOmjqe5aQq8f6wXj0zYLPqEQqvLh6YLk
v5VjLHH3C0P3qGqGqN3vwLxC6x8h3Q3QwLxC6x8h3Q3QwLxC6x8h3Q3QwLxC6x8h
3Q3QwLxC6x8h3Q3QwLxCyQIDAQAB
-----END PUBLIC KEY-----`;
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(password)
    );
    return encrypted.toString("base64");
  }

  async login(): Promise<LoginResponse | null> {
    try {
      console.log("[HikConnect] Attempting login...");
      console.log("[HikConnect] Username:", this.username);
      console.log("[HikConnect] API Base URL:", this.axios.defaults.baseURL);
      
      const encryptedPassword = this.encryptPassword(this.password);
      
      const params = new URLSearchParams();
      params.append('checkSign', 'false');
      params.append('cuName', 'd2Vi');
      params.append('account', this.username);
      params.append('password', encryptedPassword);
      params.append('imageCode', '');

      const response = await this.axios.post("/v3/users/login/v6", params, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'appid': 'Hik-Connect-Portal',
        }
      });

      console.log("[HikConnect] Login response status:", response.status);
      console.log("[HikConnect] Login response data:", JSON.stringify(response.data, null, 2));

      if (response.data && response.data.sessionId) {
        this.sessionId = response.data.sessionId;
        this.featureCode = response.data.featureCode || '';
        this.customNo = response.data.customNo || '';
        
        if (response.data.expiry) {
          this.sessionExpiry = new Date(Date.now() + response.data.expiry * 1000);
        }
        
        console.log("[HikConnect] Login successful, session ID obtained");
        return {
          sessionId: response.data.sessionId,
          featureCode: response.data.featureCode,
          customNo: response.data.customNo,
          expiry: response.data.expiry,
        };
      }

      console.log("[HikConnect] Login failed: No sessionId in response");
      return null;
    } catch (error: any) {
      console.error("[HikConnect] Login failed with error:");
      console.error("[HikConnect] Error message:", error.message);
      console.error("[HikConnect] Error response status:", error.response?.status);
      console.error("[HikConnect] Error response data:", JSON.stringify(error.response?.data, null, 2));
      return null;
    }
  }

  isSessionValid(): boolean {
    if (!this.sessionId || !this.sessionExpiry) {
      return false;
    }
    return this.sessionExpiry > new Date();
  }

  async getDevicesBySerialNumbers(serialNumbers: string[]): Promise<HikConnectDevice[]> {
    console.log("[HikConnect] getDevicesBySerialNumbers() called with serials:", serialNumbers);
    
    if (!this.isSessionValid()) {
      console.log("[HikConnect] Session invalid or missing, attempting login...");
      const loginResponse = await this.login();
      if (!loginResponse) {
        console.error("[HikConnect] Login failed");
        return [];
      }
    }

    try {
      const serialParam = serialNumbers.join(',');
      console.log("[HikConnect] Fetching devices from API...");
      console.log("[HikConnect] Request URL: /v3/open/trust/v1/group/device?serial=" + serialParam);
      
      const response = await this.axios.get(`/v3/open/trust/v1/group/device`, {
        params: { serial: serialParam },
        headers: {
          'sessionid': this.sessionId,
          'featurecode': this.featureCode || '',
          'customno': this.customNo || '',
        },
      });

      console.log("[HikConnect] Device API response status:", response.status);
      console.log("[HikConnect] Device API response:", JSON.stringify(response.data, null, 2));

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const devices = response.data.data.map((device: any) => ({
          deviceId: device.deviceId || device.deviceSerial,
          deviceName: device.deviceName || device.name,
          deviceSerial: device.deviceSerial,
          deviceType: device.deviceType,
          version: device.version,
          status: device.status || (device.onlineStatus === 'online' ? 1 : 0),
        }));
        console.log("[HikConnect] Successfully mapped", devices.length, "devices");
        return devices;
      }

      console.log("[HikConnect] No devices found in response");
      return [];
    } catch (error: any) {
      console.error("[HikConnect] Failed to fetch devices by serial:");
      console.error("[HikConnect] Error message:", error.message);
      console.error("[HikConnect] Error response:", JSON.stringify(error.response?.data, null, 2));
      return [];
    }
  }

  async getDevices(): Promise<HikConnectDevice[]> {
    console.log("[HikConnect] getDevices() called");
    console.log("[HikConnect] WARNING: The real Hik-Connect API requires serial numbers to fetch devices.");
    console.log("[HikConnect] Please use /api/branches/create-with-devices or /api/branches/:id/sync-devices with serial numbers instead.");
    console.log("[HikConnect] Returning empty array. Configure devices via the new serial-number-based endpoints.");
    return [];
  }

  async checkDeviceStatus(serialNumbers: string[]): Promise<HikConnectDevice[]> {
    console.log("[HikConnect] checkDeviceStatus() called");
    return this.getDevicesBySerialNumbers(serialNumbers);
  }

  getSessionInfo(): { sessionId?: string; featureCode?: string; customNo?: string; sessionExpiry?: Date } {
    return {
      sessionId: this.sessionId,
      featureCode: this.featureCode,
      customNo: this.customNo,
      sessionExpiry: this.sessionExpiry,
    };
  }
}
