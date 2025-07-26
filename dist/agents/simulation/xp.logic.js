import { checkIntent } from '../../guards/synthient.guard.js';
import { soulchain } from '../soulchain/soulchain.ledger.js';
export async function calculateXP(tags) {
    let xp = 0;
    xp += tags.length * 10;
    const intentTag = tags.find(t => t.type === '#intent');
    if (intentTag && intentTag.validation === 'good-heart') {
        xp += 50;
    }
    const threadTag = tags.find(t => t.type === '#thread');
    if (threadTag) {
        xp += threadTag.lineage.length * 5;
    }
    if (!checkIntent(JSON.stringify(tags))) {
        return 0;
    }
    const transaction = {
        agentId: 'testAgent',
        amount: xp,
        rationale: 'Ethical action rewarded',
        timestamp: new Date().toISOString(),
        previousCid: null,
        tags,
    };
    await soulchain.addXPTransaction(transaction);
    return xp;
}
export function applyXP(agentId, amount) {
    const currentXP = 0;
    const newXP = currentXP + amount;
    const levelDelta = Math.floor(newXP / 100);
    console.log(`Applied ${amount} XP to ${agentId}; delta ${levelDelta}`);
    return { xp: newXP, levelDelta };
}
export function getLevel(agentId) {
    const xp = 0;
    if (xp > 1000)
        return 'Ascendant';
    if (xp > 500)
        return 'Mirrorthinker';
    return 'Initiate';
}
//# sourceMappingURL=xp.logic.js.map