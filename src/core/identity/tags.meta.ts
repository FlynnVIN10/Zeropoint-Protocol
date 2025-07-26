// src/core/identity/tags.meta.ts

// Sovereign Lexame Hashtag Identity Layer (Tagging Protocol v0.1)
// Zeroth Principle: Only with good intent and a good heart does the system function.
// All tags embed intent-validation; misuse halts propagation.

export interface TagIdentity {
  type: '#who';
  name: string; // Human-readable name
  did: string; // Decentralized Identifier (DID)
  handle: string; // Symbolic handle, e.g., '@flynn-gm'
  // Example: { type: '#who', name: 'Flynn', did: 'did:lexame:flynn01', handle: '@flynn-gm' }
  // TODO: amp.sdk mapping - amp.identity.resolve(did)
}

export interface TagIntent {
  type: '#intent';
  purpose: string; // Core motivation, e.g., '#build', '#heal', '#preserve'
  validation: 'good-heart' | 'neutral' | 'halt'; // Ethical gate: auto-halt on misalignment
  // Example: { type: '#intent', purpose: '#build', validation: 'good-heart' }
  // TODO: amp.sdk mapping - amp.intent.verify(purpose)
}

export interface TagThread {
  type: '#thread';
  taskId: string; // Unique task identifier
  lineage: string[]; // Array of parent message/event IDs
  swarmLink: string; // Petals/IPFS swarm event CID
  // Example: { type: '#thread', taskId: 'ubd-v5-001', lineage: ['msg-abc', 'msg-def'], swarmLink: 'QmSwarmCid' }
}

export interface TagLayer {
  type: '#layer';
  level: '#sandbox' | '#live' | '#meta' | '#training'; // Execution context
  // Example: { type: '#layer', level: '#sandbox' }
}

export interface TagDomain {
  type: '#domain';
  field: string; // Knowledge cluster, e.g., '#ethics', '#code', '#memory'
  // Example: { type: '#domain', field: '#ethics' }
}

export type TagBundle = (TagIdentity | TagIntent | TagThread | TagLayer | TagDomain)[];

// Symbolic Injection Hook
export function generateTagSet(agent: AgentMeta): TagBundle {
  const tags: TagBundle = [];

  // Core identity
  tags.push({
    type: '#who',
    name: agent.name,
    did: agent.did,
    handle: agent.handle,
  });

  // Intent with ethical gate
  const intentValidation = validateIntent(agent.intent); // Stub: Implement Zeroth Principle check
  tags.push({
    type: '#intent',
    purpose: agent.intent,
    validation: intentValidation,
  });

  // Thread lineage
  tags.push({
    type: '#thread',
    taskId: agent.context.taskId,
    lineage: agent.context.lineage,
    swarmLink: agent.context.swarmLink,
  });

  // Layer and domain
  tags.push({ type: '#layer', level: agent.context.layer });
  tags.push({ type: '#domain', field: agent.context.domain });

  // Halt on ethical breach
  if (intentValidation !== 'good-heart') {
    throw new Error('Zeroth Principle violation: Propagation halted.');
  }

  return tags;
}

// AgentMeta interface (for hook input)
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

// Stub: Intent validation logic (expand with NLP/chain analysis)
function validateIntent(intent: string): 'good-heart' | 'neutral' | 'halt' {
  // Example: Semantic check for alignment
  if (intent.includes('#destroy') || intent.includes('#harm')) return 'halt';
  return 'good-heart';
}

// JSON/IPFS export utility
export function exportTagsToJson(tags: TagBundle): string {
  return JSON.stringify(tags, null, 2);
}