import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
    username: string;
    email: string;
    roles: string[];
    iat: number;
    exp: number;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        username: string;
        email: string;
        roles: string[];
    }>;
    private logAuthEvent;
}
export {};
