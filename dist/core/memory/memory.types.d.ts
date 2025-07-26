import { TagBundle } from '../identity/tags.meta.js';
export interface MemoryEntry {
    timestamp: string;
    context: {
        agentId: string;
        domain: string;
        layer: string;
        threadId: string;
    };
    tags: TagBundle;
    xp: number;
    summary: string;
    linkedCode?: string;
    petalsScore?: number;
    ethicalRating?: 'aligned' | 'warn' | 'reject';
}
export interface MemorySummary {
    agentId: string;
    totalXP: number;
    topDomains: string[];
    dominantIntent: string;
    ethicsRatio: {
        aligned: number;
        warn: number;
        reject: number;
    };
    timeline: MemoryEntry[];
}
export declare function createMemoryEntry(params: {
    agentId: string;
    domain: string;
    layer: string;
    threadId: string;
    tags: TagBundle;
    xp: number;
    summary: string;
    linkedCode?: string;
    petalsScore?: number;
    ethicalRating?: 'aligned' | 'warn' | 'reject';
}): MemoryEntry;
export declare function compressMemory(entries: MemoryEntry[], batchSize?: number): MemoryEntry[][];
