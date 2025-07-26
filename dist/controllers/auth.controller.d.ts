import { AuthService } from '../services/auth.service.js';
import { RegisterDto, LoginDto, RefreshTokenDto, ChangePasswordDto, UpdateProfileDto } from '../dto/auth.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, req: any): Promise<any>;
    login(loginDto: LoginDto, req: any): Promise<any>;
    logout(body: {
        refreshToken: string;
    }, req: any): Promise<any>;
    refreshToken(refreshTokenDto: RefreshTokenDto, req: any): Promise<any>;
    getProfile(req: any): Promise<any>;
    updateProfile(updateProfileDto: UpdateProfileDto, req: any): Promise<any>;
    changePassword(changePasswordDto: ChangePasswordDto, req: any): Promise<any>;
    getActiveSessions(req: any): Promise<any>;
    revokeSession(req: any): Promise<any>;
    getAuthStatus(): Promise<any>;
}
