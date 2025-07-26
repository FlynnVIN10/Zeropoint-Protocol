import { MemorySummary } from '../../core/memory/memory.types.js';
export interface IntrospectiveResponse {
    thought: string;
    sourceTags: string[];
    summaryData?: MemorySummary;
}
export interface ForkResult {
    projectedPath: string;
    projectedXP: number;
    ethicalRisk: 'low' | 'medium' | 'high';
    tagShift: string[];
}
export declare function buildThoughtStream(responses: IntrospectiveResponse[]): string;
export declare function mirrorResponse(summary: MemorySummary): string;
