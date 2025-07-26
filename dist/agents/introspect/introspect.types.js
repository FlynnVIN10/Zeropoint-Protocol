export function buildThoughtStream(responses) {
    return responses.map(r => `💭 ${r.thought}`).join('\n');
}
export function mirrorResponse(summary) {
    const { dominantIntent, totalXP, topDomains } = summary;
    return `I have ${totalXP} XP, my main drive is "${dominantIntent}", and I dwell most in [${topDomains.join(', ')}].`;
}
//# sourceMappingURL=introspect.types.js.map