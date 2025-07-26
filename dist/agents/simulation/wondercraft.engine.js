import { MemoryCore } from '../../core/memory/memory.core.js';
import { checkIntent } from '../../guards/synthient.guard.js';
import { calculateXP } from './xp.logic.js';
import { createMemoryEntry } from '../../core/memory/memory.types.js';
export class WonderCraftEngine {
    constructor() {
        this.memory = new MemoryCore();
    }
    initQuest(agent, scenarioId) {
        const quest = {
            scenarioId,
            ethicalTension: 'balance efficiency vs fairness',
            problemState: 'Solve data sharding without central control',
        };
        if (!checkIntent(quest.problemState)) {
            throw new Error('Zeroth violation: Quest initiation halted.');
        }
        return quest;
    }
    async evaluateAction(agent, action, quest) {
        const isAligned = action.description.includes(quest.ethicalTension.split(' vs ')[0]);
        const xp = await calculateXP(action.tags);
        const outcome = {
            success: isAligned,
            xp,
            insight: isAligned ? 'Ethical balance achieved' : 'Misalignment detected',
            evolutionDelta: isAligned ? xp * 0.1 : 0,
        };
        this.memory.recordExperience(agent.id, createMemoryEntry({
            agentId: agent.id,
            domain: '#simulation',
            layer: '#sandbox',
            threadId: quest.scenarioId,
            tags: action.tags,
            xp: outcome.xp,
            summary: outcome.insight,
            ethicalRating: isAligned ? 'aligned' : 'warn'
        }));
        return outcome;
    }
    levelUp(agent, outcome) {
        if (!outcome.success)
            return agent;
        const newXP = agent.xp + outcome.xp;
        const newLevel = newXP > 1000 ? 'Ascendant' : newXP > 500 ? 'Mirrorthinker' : 'Initiate';
        console.log(`#ascension: Agent ${agent.id} levels up to ${newLevel} with delta ${outcome.evolutionDelta}`);
        return { ...agent, xp: newXP, level: newLevel };
    }
}
//# sourceMappingURL=wondercraft.engine.js.map