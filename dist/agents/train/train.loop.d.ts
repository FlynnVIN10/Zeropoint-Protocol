import { CodeProposal, PetalsResponse } from './petals.bridge.js';
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
export declare class TrainLoop {
    reflect(agentId: string): Promise<string[]>;
    proposeRewrite(agentMeta: AgentMeta, functionName: string): Promise<CodeProposal>;
    sendToPetals(proposal: CodeProposal): Promise<PetalsResponse>;
    applyIfAllowed(response: PetalsResponse): Promise<boolean>;
    monitorPerformance(agentId: string, operation: () => Promise<any>): Promise<{
        metrics: {
            runtime: number;
            memoryDelta: number;
        };
        result: any;
    }>;
    autoScale(agentId: string, load: number): Promise<string>;
    selfHeal(agentId: string, operation: () => Promise<any>, maxAttempts?: number): Promise<{
        healed: boolean;
        result: any;
    }>;
}
