// © [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity.js';

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['createdAt'])
@Index(['ipAddress'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 100 })
  action: string;

  @Column({ length: 100, nullable: true })
  resource: string;

  @Column({ type: 'uuid', nullable: true })
  resourceId: string;

  @Column({ length: 45, nullable: true })
  ipAddress: string;

  @Column({ length: 500, nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>;

  @Column({ length: 20, default: 'info' })
  level: 'info' | 'warning' | 'error' | 'critical';

  @Column({ length: 50, default: 'success' })
  status: 'success' | 'failure' | 'pending';

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  static createLoginLog(userId: string, ipAddress: string, userAgent: string, success: boolean): Partial<AuditLog> {
    return {
      userId,
      action: 'login',
      resource: 'auth',
      ipAddress,
      userAgent,
      level: success ? 'info' : 'warning',
      status: success ? 'success' : 'failure',
      details: { success }
    };
  }

  static createLogoutLog(userId: string, ipAddress: string): Partial<AuditLog> {
    return {
      userId,
      action: 'logout',
      resource: 'auth',
      ipAddress,
      level: 'info',
      status: 'success'
    };
  }

  static createAPILog(userId: string, action: string, resource: string, ipAddress: string, details: any): Partial<AuditLog> {
    return {
      userId,
      action,
      resource,
      ipAddress,
      level: 'info',
      status: 'success',
      details
    };
  }
} 