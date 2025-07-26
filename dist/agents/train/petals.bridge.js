import { v4 as uuidv4 } from 'uuid';
import { checkIntent } from '../../guards/synthient.guard.js';
export function formatProposal(proposal) {
    return {
        id: uuidv4(),
        agentId: proposal.agentId,
        code: proposal.proposedCode,
        tags: proposal.tags
    };
}
export async function callPetalsAPI(request) {
    if (!checkIntent(request.code + JSON.stringify(request.tags)))
        throw new Error('Zeroth violation: Petals call blocked.');
    return {
        rewrittenCode: request.code,
        trustScore: 0.9,
        ethicalRating: 'aligned',
        notes: ['Stub: auto-approved (replace with real Petals call)'],
    };
}
export async function logTrainingCycle(agentId, summary) {
    if (!checkIntent(agentId + JSON.stringify(summary)))
        throw new Error('Zeroth violation: Petals log blocked.');
    console.log(`[PetalsCycle] Agent=${agentId}`, summary);
}
//# sourceMappingURL=petals.bridge.js.map