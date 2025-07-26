import * as fs from 'fs/promises';
const memoryStore = {};
export class MemoryCore {
    async recordExperience(agentId, event) {
        if (!memoryStore[agentId]) {
            memoryStore[agentId] = [];
        }
        memoryStore[agentId].push(event);
        await fs.appendFile(`./memory-${agentId}.json`, JSON.stringify(event) + '\n', 'utf8');
        if (event.ethicalRating === 'reject') {
            console.warn(`Memory entry for ${agentId} flagged: Ethical rejection logged.`);
        }
    }
    recallByTag(agentId, tag) {
        if (!memoryStore[agentId])
            return [];
        return memoryStore[agentId].filter(entry => entry.tags.some(t => (t.type === '#intent' && t.purpose === tag) ||
            (t.type === '#domain' && t.field === tag) ||
            (t.type === '#thread' && t.taskId === tag)));
    }
    summarizeHistory(agentId) {
        var _a;
        const entries = memoryStore[agentId] || [];
        if (entries.length === 0) {
            return {
                agentId,
                totalXP: 0,
                topDomains: [],
                dominantIntent: '',
                ethicsRatio: { aligned: 0, warn: 0, reject: 0 },
                timeline: [],
            };
        }
        const totalXP = entries.reduce((sum, e) => sum + e.xp, 0);
        const domainCounts = {};
        entries.forEach(e => domainCounts[e.context.domain] = (domainCounts[e.context.domain] || 0) + 1);
        const topDomains = Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([domain]) => domain);
        const intentCounts = {};
        entries.forEach(e => {
            const intentTag = e.tags.find(t => t.type === '#intent');
            if (intentTag)
                intentCounts[intentTag.purpose] = (intentCounts[intentTag.purpose] || 0) + 1;
        });
        const dominantIntent = ((_a = Object.entries(intentCounts)
            .sort((a, b) => b[1] - a[1])[0]) === null || _a === void 0 ? void 0 : _a[0]) || '';
        const ethicsRatio = entries.reduce((ratio, e) => {
            if (e.ethicalRating)
                ratio[e.ethicalRating]++;
            return ratio;
        }, { aligned: 0, warn: 0, reject: 0 });
        const timeline = entries.slice(-10);
        return { agentId, totalXP, topDomains, dominantIntent, ethicsRatio, timeline };
    }
}
//# sourceMappingURL=memory.core.js.map