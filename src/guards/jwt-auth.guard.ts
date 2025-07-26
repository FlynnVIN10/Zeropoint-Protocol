// © [2025] Zeropoint Protocol, LLC. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { checkIntent } from '../guards/synthient.guard.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // Zeroth-gate: block if intent is not aligned
    if (!checkIntent('jwt-auth')) throw new UnauthorizedException('Zeroth violation: Auth blocked.');
    return super.canActivate(context);
  }
} 