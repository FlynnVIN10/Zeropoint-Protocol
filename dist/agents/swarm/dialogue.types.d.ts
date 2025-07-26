export interface DialogueTranscript {
    speaker: string;
    message: string;
    dominantIntent: string;
    ethicsRatio: {
        aligned: number;
        warn: number;
        reject: number;
    };
}
export interface SwarmResolution {
    question: string;
    responses: Record<string, string>;
    consensus?: string;
    divergenceScore: number;
}
export interface CollectiveInsight {
    tagEcho: string[];
    emergentIntent: string;
    insightLog: DialogueTranscript[];
}
export declare function measureDivergence(transcripts: DialogueTranscript[]): number;
export declare function aggregateTagField(transcripts: DialogueTranscript[]): string[];
export declare function streamInsight(insight: CollectiveInsight): string;
