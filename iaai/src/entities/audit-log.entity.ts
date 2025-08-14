// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity.js";

@Entity("audit_logs")
@Index(["userId"])
@Index(["action"])
@Index(["createdAt"])
@Index(["ipAddress"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "user_id", type: "uuid", nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100, nullable: true })
  resource: string;

  @Column({ name: "resource_id", type: "uuid", nullable: true })
  resourceId: string;

  @Column({ name: "ip_address", length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: "user_agent", length: 500, nullable: true })
  userAgent: string;

  @Column({ type: "jsonb", nullable: true })
  details: Record<string, any>;

  @Column({ length: 20, default: "info" })
  level: "info" | "warning" | "error" | "critical";

  @Column({ length: 50, default: "success" })
  status: "success" | "failure" | "pending";

  @Column({ name: "error_message", type: "text", nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  static createLoginLog(
    userId: string,
    ipAddress: string,
    userAgent: string,
    success: boolean,
  ): Partial<AuditLog> {
    return {
      userId,
      action: "login",
      resource: "auth",
      ipAddress,
      userAgent,
      level: success ? "info" : "warning",
      status: success ? "success" : "failure",
      details: { success },
    };
  }

  static createLogoutLog(userId: string, ipAddress: string): Partial<AuditLog> {
    return {
      userId,
      action: "logout",
      resource: "auth",
      ipAddress,
      level: "info",
      status: "success",
    };
  }

  static createAPILog(
    userId: string,
    action: string,
    resource: string,
    ipAddress: string,
    details: any,
  ): Partial<AuditLog> {
    return {
      userId,
      action,
      resource,
      ipAddress,
      level: "info",
      status: "success",
      details,
    };
  }
}
