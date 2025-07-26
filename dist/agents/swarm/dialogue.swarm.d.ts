export interface SwarmConsensus {
    peers: string[];
    sharedRationale: string;
    consensus: boolean;
    xpReward: number;
}
export declare class SwarmNetwork {
    node: any;
    peers: string[];
    start(port?: number): Promise<void>;
    multiInstanceNetwork(question: string, maxDepth?: number, depth?: number): Promise<SwarmConsensus>;
}
