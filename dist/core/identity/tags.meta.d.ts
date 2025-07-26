export interface TagIdentity {
    type: '#who';
    name: string;
    did: string;
    handle: string;
}
export interface TagIntent {
    type: '#intent';
    purpose: string;
    validation: 'good-heart' | 'neutral' | 'halt';
}
export interface TagThread {
    type: '#thread';
    taskId: string;
    lineage: string[];
    swarmLink: string;
}
export interface TagLayer {
    type: '#layer';
    level: '#sandbox' | '#live' | '#meta' | '#training';
}
export interface TagDomain {
    type: '#domain';
    field: string;
}
export type TagBundle = (TagIdentity | TagIntent | TagThread | TagLayer | TagDomain)[];
export declare function generateTagSet(agent: AgentMeta): TagBundle;
export interface AgentMeta {
    name: string;
    did: string;
    handle: string;
    intent: string;
    context: {
        taskId: string;
        lineage: string[];
        swarmLink: string;
        layer: '#sandbox' | '#live' | '#meta' | '#training';
        domain: string;
    };
}
export declare function exportTagsToJson(tags: TagBundle): string;
