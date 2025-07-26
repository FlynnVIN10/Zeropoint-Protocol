import { TagBundle } from '../../core/identity/tags.meta.js';
export declare function calculateXP(tags: TagBundle): Promise<number>;
export declare function applyXP(agentId: string, amount: number): {
    xp: number;
    levelDelta: number;
};
export declare function getLevel(agentId: string): string;
