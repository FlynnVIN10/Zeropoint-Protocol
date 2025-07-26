export declare class RegisterDto {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
export declare class LoginDto {
    username: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
}
export declare class UpdatePreferencesDto {
    preferences?: Record<string, any>;
}
export declare class AssignRolesDto {
    roles: string[];
}
export declare class VerifyEmailDto {
    token: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
