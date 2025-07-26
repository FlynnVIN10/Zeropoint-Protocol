import { IntrospectiveResponse, ForkResult } from './introspect.types.js';
export declare class IntrospectCore {
    private memory;
    ask(agentId: string, question: string): Promise<IntrospectiveResponse>;
    simulateFork(agentId: string, scenario: string): Promise<ForkResult[]>;
    echo(agentId: string): Promise<string>;
    selfDialogue(agentId: string, initialThought: string, iterations?: number): Promise<string>;
}
