import { User } from './user.entity.js';
export declare class Session {
    id: string;
    token: string;
    userId: string;
    user: User;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
    expiresAt: Date;
    lastUsedAt: Date;
    createdAt: Date;
    isExpired(): boolean;
    toJSON(): Omit<this, "toJSON" | "token" | "isExpired">;
}
