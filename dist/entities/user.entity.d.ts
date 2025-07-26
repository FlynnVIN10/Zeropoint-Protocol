export declare class User {
    id: string;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    isVerified: boolean;
    lastLoginAt: Date;
    emailVerifiedAt: Date;
    preferences: Record<string, any>;
    roles: string[];
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    validatePassword(password: string): Promise<boolean>;
    toJSON(): Omit<this, "password" | "hashPassword" | "validatePassword" | "toJSON">;
}
