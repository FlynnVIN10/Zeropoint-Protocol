import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare function checkIntent(input: string): boolean;
export declare class SynthientGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
