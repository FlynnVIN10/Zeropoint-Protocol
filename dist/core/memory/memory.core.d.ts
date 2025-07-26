import { MemoryEntry, MemorySummary } from './memory.types.js';
export declare class MemoryCore {
    recordExperience(agentId: string, event: MemoryEntry): Promise<void>;
    recallByTag(agentId: string, tag: string): MemoryEntry[];
    summarizeHistory(agentId: string): MemorySummary;
}
