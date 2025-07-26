export function measureDivergence(transcripts) {
    const intents = transcripts.map(t => t.dominantIntent);
    const uniqueIntents = new Set(intents);
    const entropy = -Array.from(uniqueIntents).reduce((sum, intent) => {
        const p = intents.filter(i => i === intent).length / intents.length;
        return sum + p * Math.log2(p);
    }, 0);
    return Math.abs(entropy) / Math.log2(intents.length || 1);
}
export function aggregateTagField(transcripts) {
    return transcripts.flatMap(t => [t.dominantIntent]);
}
export function streamInsight(insight) {
    return `Emergent intent: ${insight.emergentIntent}. Log: ${insight.insightLog.map(l => l.message).join(' ')}`;
}
//# sourceMappingURL=dialogue.types.js.map