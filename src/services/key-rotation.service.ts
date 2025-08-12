import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

interface KeyPair {
  id: string;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

interface KeyRotationLog {
  id: string;
  oldKeyId: string;
  newKeyId: string;
  timestamp: Date;
  reason: string;
  soulchainHash: string;
}

@Injectable()
export class KeyRotationService {
  private readonly logger = new Logger(KeyRotationService.name);
  private readonly keysDir = path.join(process.cwd(), "keys");
  private readonly keysFile = path.join(this.keysDir, "keys.json");
  private readonly rotationLogFile = path.join(
    this.keysDir,
    "rotation-log.json",
  );
  private keys: KeyPair[] = [];
  private rotationLog: KeyRotationLog[] = [];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.initializeKeys();
  }

  private async initializeKeys(): Promise<void> {
    try {
      // Ensure keys directory exists
      if (!fs.existsSync(this.keysDir)) {
        fs.mkdirSync(this.keysDir, { recursive: true });
      }

      // Load existing keys or create new ones
      if (fs.existsSync(this.keysFile)) {
        this.keys = JSON.parse(fs.readFileSync(this.keysFile, "utf8"));
      } else {
        await this.generateNewKeyPair();
      }

      // Load rotation log
      if (fs.existsSync(this.rotationLogFile)) {
        this.rotationLog = JSON.parse(
          fs.readFileSync(this.rotationLogFile, "utf8"),
        );
      }

      // Check if key rotation is needed
      await this.checkAndRotateKeys();
    } catch (error) {
      this.logger.error("Failed to initialize keys", error);
      throw error;
    }
  }

  async generateNewKeyPair(): Promise<KeyPair> {
    const keyId = crypto.randomUUID();
    const keyPair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
      },
    });

    const newKey: KeyPair = {
      id: keyId,
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    };

    this.keys.push(newKey);
    await this.saveKeys();

    // Log to soulchain
    await this.logToSoulchain("KEY_GENERATED", {
      keyId,
      createdAt: newKey.createdAt,
      expiresAt: newKey.expiresAt,
    });

    this.logger.log(`Generated new key pair: ${keyId}`);
    return newKey;
  }

  async getCurrentKey(): Promise<string> {
    const currentKey = this.keys.find((key) => key.isActive);
    if (!currentKey) {
      throw new Error("No active key found");
    }
    return currentKey.privateKey;
  }

  async getCurrentKeyId(): Promise<string> {
    const currentKey = this.keys.find((key) => key.isActive);
    if (!currentKey) {
      throw new Error("No active key found");
    }
    return currentKey.id;
  }

  async rotateKeys(reason: string = "scheduled_rotation"): Promise<void> {
    try {
      const oldKey = this.keys.find((key) => key.isActive);
      if (!oldKey) {
        throw new Error("No active key to rotate");
      }

      // Generate new key
      const newKey = await this.generateNewKeyPair();

      // Deactivate old key
      oldKey.isActive = false;

      // Keep old key for grace period (7 days)
      oldKey.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Log rotation
      const rotationLog: KeyRotationLog = {
        id: crypto.randomUUID(),
        oldKeyId: oldKey.id,
        newKeyId: newKey.id,
        timestamp: new Date(),
        reason,
        soulchainHash: await this.generateSoulchainHash("KEY_ROTATION", {
          oldKeyId: oldKey.id,
          newKeyId: newKey.id,
          reason,
        }),
      };

      this.rotationLog.push(rotationLog);
      await this.saveKeys();
      await this.saveRotationLog();

      // Log to soulchain
      await this.logToSoulchain("KEY_ROTATED", {
        oldKeyId: oldKey.id,
        newKeyId: newKey.id,
        reason,
        timestamp: rotationLog.timestamp,
      });

      this.logger.log(`Key rotated: ${oldKey.id} -> ${newKey.id}`);
    } catch (error) {
      this.logger.error("Failed to rotate keys", error);
      throw error;
    }
  }

  async checkAndRotateKeys(): Promise<void> {
    const currentKey = this.keys.find((key) => key.isActive);
    if (!currentKey) {
      await this.generateNewKeyPair();
      return;
    }

    // Check if key is expiring soon
    const isExpiringSoon = (key: KeyPair): boolean => {
      const now = Date.now();
      const expirationTime = key.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000; // 30 days validity
      const timeUntilExpiration = expirationTime - now;
      
      // Check if key is expiring soon
      return timeUntilExpiration < 0;
    };

    if (isExpiringSoon(currentKey)) {
      await this.rotateKeys("expiring_soon");
    }

    // Clean up expired keys
    this.keys = this.keys.filter((key) => key.expiresAt > new Date());
    await this.saveKeys();
  }

  async logKeyRotation(oldKeyId: string, reason: string): Promise<void> {
    await this.logToSoulchain("KEY_ROTATION_LOG", {
      oldKeyId,
      reason,
      timestamp: new Date(),
    });
  }

  async logAuthentication(payload: any, ip: string): Promise<void> {
    await this.logToSoulchain("AUTH_SUCCESS", {
      userId: payload.sub,
      keyId: payload.keyId,
      ip,
      timestamp: new Date(),
    });
  }

  async logFailedAuthentication(
    token: string,
    ip: string,
    error: string,
  ): Promise<void> {
    await this.logToSoulchain("AUTH_FAILED", {
      tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
      ip,
      error,
      timestamp: new Date(),
    });
  }

  private async generateSoulchainHash(
    action: string,
    data: any,
  ): Promise<string> {
    const payload = {
      action,
      data,
      timestamp: new Date().toISOString(),
      environment: this.configService.get("NODE_ENV", "development"),
    };

    return crypto
      .createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex");
  }

  private async logToSoulchain(action: string, data: any): Promise<void> {
    try {
      const soulchainPayload = {
        hashId: await this.generateSoulchainHash(action, data),
        action: `SOULSEC:${action}`,
        metadata: {
          service: "key-rotation",
          environment: this.configService.get("NODE_ENV", "development"),
          version: this.configService.get("APP_VERSION", "1.0.0"),
        },
        data: JSON.stringify(data),
        timestamp: new Date(),
        environment: this.configService.get("NODE_ENV", "development"),
      };

      // In a real implementation, this would send to soulchain
      this.logger.log(`SOULSEC:LOG ${action} - ${soulchainPayload.hashId}`);
    } catch (error) {
      this.logger.error("Failed to log to soulchain", error);
    }
  }

  private async saveKeys(): Promise<void> {
    fs.writeFileSync(this.keysFile, JSON.stringify(this.keys, null, 2));
  }

  private async saveRotationLog(): Promise<void> {
    fs.writeFileSync(
      this.rotationLogFile,
      JSON.stringify(this.rotationLog, null, 2),
    );
  }

  // Public methods for monitoring
  async getKeyStatus(): Promise<any> {
    return {
      currentKeyId: await this.getCurrentKeyId(),
      totalKeys: this.keys.length,
      activeKeys: this.keys.filter((k) => k.isActive).length,
      expiredKeys: this.keys.filter((k) => k.expiresAt <= new Date()).length,
      lastRotation: this.rotationLog[this.rotationLog.length - 1]?.timestamp,
    };
  }

  async getRotationHistory(): Promise<KeyRotationLog[]> {
    return this.rotationLog.slice(-10); // Last 10 rotations
  }
}
