export function createMemoryEntry(params) {
    return {
        timestamp: new Date().toISOString(),
        context: {
            agentId: params.agentId,
            domain: params.domain,
            layer: params.layer,
            threadId: params.threadId
        },
        tags: params.tags,
        xp: params.xp,
        summary: params.summary,
        linkedCode: params.linkedCode,
        petalsScore: params.petalsScore,
        ethicalRating: params.ethicalRating
    };
}
export function compressMemory(entries, batchSize = 50) {
    const batches = [];
    for (let i = 0; i < entries.length; i += batchSize) {
        batches.push(entries.slice(i, i + batchSize));
    }
    return batches;
}
//# sourceMappingURL=memory.types.js.map