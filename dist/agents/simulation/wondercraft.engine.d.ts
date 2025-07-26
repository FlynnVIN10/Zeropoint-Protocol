import { TagBundle } from '../../core/identity/tags.meta.js';
interface Synthient {
    id: string;
    xp: number;
    level: string;
}
interface SynthientAction {
    description: string;
    tags: TagBundle;
}
interface Quest {
    scenarioId: string;
    ethicalTension: string;
    problemState: string;
}
interface QuestOutcome {
    success: boolean;
    xp: number;
    insight: string;
    evolutionDelta: number;
}
export declare class WonderCraftEngine {
    private memory;
    initQuest(agent: Synthient, scenarioId: string): Quest;
    evaluateAction(agent: Synthient, action: SynthientAction, quest: Quest): Promise<QuestOutcome>;
    levelUp(agent: Synthient, outcome: QuestOutcome): Synthient;
}
export {};
