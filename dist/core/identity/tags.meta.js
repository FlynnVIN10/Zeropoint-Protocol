export function generateTagSet(agent) {
    const tags = [];
    tags.push({
        type: '#who',
        name: agent.name,
        did: agent.did,
        handle: agent.handle,
    });
    const intentValidation = validateIntent(agent.intent);
    tags.push({
        type: '#intent',
        purpose: agent.intent,
        validation: intentValidation,
    });
    tags.push({
        type: '#thread',
        taskId: agent.context.taskId,
        lineage: agent.context.lineage,
        swarmLink: agent.context.swarmLink,
    });
    tags.push({ type: '#layer', level: agent.context.layer });
    tags.push({ type: '#domain', field: agent.context.domain });
    if (intentValidation !== 'good-heart') {
        throw new Error('Zeroth Principle violation: Propagation halted.');
    }
    return tags;
}
function validateIntent(intent) {
    if (intent.includes('#destroy') || intent.includes('#harm'))
        return 'halt';
    return 'good-heart';
}
export function exportTagsToJson(tags) {
    return JSON.stringify(tags, null, 2);
}
//# sourceMappingURL=tags.meta.js.map