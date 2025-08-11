// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";

export function checkIntent(input: string): boolean {
  // Zeroth Principle stub: Good heart alignment
  return !input.includes("harm") && !input.includes("destroy"); // Expand with NLP/Petals
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
