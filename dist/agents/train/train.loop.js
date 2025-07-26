import { parse } from '@typescript-eslint/parser';
import { generateTagSet } from '../../core/identity/tags.meta.js';
import { checkIntent } from '../../guards/synthient.guard.js';
import { formatProposal, callPetalsAPI, logTrainingCycle } from './petals.bridge.js';
import { soulchain } from '../soulchain/soulchain.ledger.js';
export class TrainLoop {
    async reflect(agentId) {
        const codebase = `// Sample agent code\n function outdatedFn() { /* inefficient loop */ for(let i=0; i<100000; i++) {} }\n function efficientFn() { /* optimized */ }`;
        const ast = parse(codebase, { sourceType: 'module' });
        const flagged = [];
        ast.body.forEach((node) => {
            if (node.type === 'FunctionDeclaration' && node.body.body.some((stmt) => stmt.type === 'ForStatement')) {
                flagged.push(node.id.name);
            }
        });
        return flagged;
    }
    async proposeRewrite(agentMeta, functionName) {
        const originalCode = `// original code for ${functionName}`;
        const proposedCode = `// improved code for ${functionName}`;
        const rationale = `Refactored ${functionName} for clarity and performance.`;
        const tags = generateTagSet(agentMeta);
        return {
            agentId: agentMeta.name,
            functionName,
            originalCode,
            proposedCode,
            rationale,
            tags
        };
    }
    async sendToPetals(proposal) {
        const request = formatProposal(proposal);
        const response = await callPetalsAPI(request);
        await logTrainingCycle(proposal.agentId, response);
        return response;
    }
    async applyIfAllowed(response) {
        var _a;
        if (response.ethicalRating === 'reject')
            return false;
        if (!checkIntent(((_a = response.notes) === null || _a === void 0 ? void 0 : _a.join(' ')) || ''))
            return false;
        console.log(`Applying rewrite: ${response.rewrittenCode}`);
        return true;
    }
    async monitorPerformance(agentId, operation) {
        const startTime = process.hrtime();
        const startMemory = process.memoryUsage().heapUsed;
        const result = await operation();
        const [s, ns] = process.hrtime(startTime);
        const runtime = s * 1000 + ns / 1e6;
        const memoryDelta = (process.memoryUsage().heapUsed - startMemory) / 1024 / 1024;
        const metrics = { runtime, memoryDelta };
        const rationale = `Operation metrics: runtime ${runtime}ms, memory delta ${memoryDelta}MB`;
        if (!checkIntent(rationale)) {
            throw new Error('Zeroth violation: Optimization halted.');
        }
        await soulchain.addXPTransaction({
            agentId,
            amount: -memoryDelta,
            rationale,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: []
        });
        return { metrics, result };
    }
    async autoScale(agentId, load) {
        const threshold = 0.8;
        let action = 'Maintain';
        if (load > threshold) {
            action = 'Scale up: Add agent instance';
        }
        else if (load < 0.3) {
            action = 'Scale down: Remove agent instance';
        }
        const rationale = `Auto-scale action: ${action} at load ${load}`;
        if (!checkIntent(rationale)) {
            throw new Error('Zeroth violation: Scaling halted.');
        }
        await soulchain.addXPTransaction({
            agentId,
            amount: 10,
            rationale,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: []
        });
        return action;
    }
    async selfHeal(agentId, operation, maxAttempts = 2) {
        let attempts = 0;
        let lastError = null;
        while (attempts < maxAttempts) {
            try {
                const result = await operation();
                if (attempts > 0) {
                    const rationale = `Self-heal: Operation succeeded after ${attempts} attempt(s).`;
                    if (!checkIntent(rationale))
                        throw new Error('Zeroth violation: Healing rationale rejected.');
                    await soulchain.addXPTransaction({
                        agentId,
                        amount: 20,
                        rationale,
                        timestamp: new Date().toISOString(),
                        previousCid: null,
                        tags: [],
                    });
                }
                return { healed: attempts > 0, result };
            }
            catch (err) {
                lastError = err;
                attempts++;
            }
        }
        const rationale = `Self-heal failed after ${maxAttempts} attempts: ${lastError}`;
        if (!checkIntent(rationale))
            throw new Error('Zeroth violation: Healing failure rationale rejected.');
        await soulchain.addXPTransaction({
            agentId,
            amount: 0,
            rationale,
            timestamp: new Date().toISOString(),
            previousCid: null,
            tags: [],
        });
        throw lastError;
    }
}
//# sourceMappingURL=train.loop.js.map