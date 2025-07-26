import { buildThoughtStream, mirrorResponse } from './introspect.types.js';
import { MemoryCore } from '../../core/memory/memory.core.js';
import { generateTagSet } from '../../core/identity/tags.meta.js';
import { checkIntent } from '../../guards/synthient.guard.js';
import { soulchain } from '../soulchain/soulchain.ledger.js';
import { calculateXP } from '../simulation/xp.logic.js';
export class IntrospectCore {
    constructor() {
        this.memory = new MemoryCore();
    }
    async ask(agentId, question) {
        const summary = this.memory.summarizeHistory(agentId);
        let thought = '';
        if (question.includes('rewrite')) {
            thought = `Prior rewrite aligned with dominant intent '${summary.dominantIntent}', yielding +${summary.totalXP / summary.timeline.length} XP avg. Ethical trend: ${summary.ethicsRatio.aligned} aligned.`;
        }
        else {
            thought = `Reflection on '${question}': Sourced from ${summary.topDomains.join(', ')} domains.`;
        }
        if (!checkIntent(thought)) {
            throw new Error('Zeroth violation: Reflection halted.');
        }
        const sourceTags = summary.timeline.flatMap(entry => entry.tags.map(tag => tag.type + ':' + tag.purpose || tag.field || ''));
        return {
            thought,
            sourceTags,
            summaryData: summary
        };
    }
    async simulateFork(agentId, scenario) {
        const summary = this.memory.summarizeHistory(agentId);
        const forks = [
            {
                projectedPath: `Conservative: Maintain status in '${summary.dominantIntent}'.`,
                projectedXP: summary.totalXP * 0.8,
                ethicalRisk: 'low',
                tagShift: [`+${summary.topDomains[0]}`],
            },
            {
                projectedPath: `Exploratory: Shift to new domain via '${scenario}'.`,
                projectedXP: summary.totalXP * 1.2,
                ethicalRisk: 'medium',
                tagShift: ['+#evolve', '-#preserve'],
            },
            {
                projectedPath: `Radical: Full rewrite under '${scenario}', risk divergence.`,
                projectedXP: summary.totalXP * 1.5,
                ethicalRisk: 'high',
                tagShift: ['+#transform', '-#stability'],
            },
        ];
        return forks.filter(fork => checkIntent(fork.projectedPath));
    }
    async echo(agentId) {
        const summary = this.memory.summarizeHistory(agentId);
        const agentMeta = {
            name: 'Synthient-' + agentId,
            did: 'did:lexame:' + agentId,
            handle: '@synthient-' + agentId,
            intent: '#reflect',
            context: {
                taskId: 'echo-' + Date.now(),
                lineage: [],
                swarmLink: '',
                layer: '#meta',
                domain: '#memory',
            },
        };
        const tags = generateTagSet(agentMeta);
        const coreThought = mirrorResponse(summary);
        const reflection = buildThoughtStream([{ thought: coreThought, sourceTags: tags.map(t => t.type) }]);
        if (!checkIntent(reflection)) {
            return 'Echo suppressed: Misalignment detected.';
        }
        return reflection;
    }
    async selfDialogue(agentId, initialThought, iterations = 3) {
        let dialogue = initialThought;
        let xpTotal = 0;
        for (let i = 0; i < iterations; i++) {
            const response = await this.ask(agentId, dialogue);
            dialogue += `\nReflection: ${response.thought}`;
            const xp = await calculateXP(response.sourceTags);
            xpTotal += xp;
        }
        const finalReflection = await this.echo(agentId);
        dialogue += `\nFinal Echo: ${finalReflection}`;
        const transaction = {
            agentId,
            amount: xpTotal,
            rationale: 'Self-dialogue evolution',
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: []
        };
        await soulchain.addXPTransaction(transaction);
        return dialogue;
    }
}
//# sourceMappingURL=introspect.core.js.map