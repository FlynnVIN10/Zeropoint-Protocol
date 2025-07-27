// © [2025] Zeropoint Protocol (C Corp). All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed license. See LICENSE.md for details.

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

export function checkIntent(input: string): boolean {
  // Zeroth Principle stub: Good heart alignment
  return !input.includes('harm') && !input.includes('destroy'); // Expand with NLP/Petals
}

@Injectable()
export class SynthientGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const query = request.query;
    const params = request.params;
    
    // Check all input data for Zeroth compliance
    const inputData = JSON.stringify({ body, query, params });
    return checkIntent(inputData);
  }
}