// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

export interface PetalsConfig {
  modelName: string;
  maxLength: number;
  temperature: number;
  topP: number;
  localOnly: boolean;
  peerAllowlist: string[];
  bandwidthLimit: number; // bytes per second
  healthCheckInterval: number; // milliseconds
  maxPeers: number;
  enableMTLS: boolean;
  rateLimit: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
}

export interface GenerationOptions {
  maxTokens: number;
  modelName?: string;
  localOnly?: boolean;
  temperature?: number;
  topP?: number;
}

export interface GenerationResult {
  tokens: number;
  dropped: number;
  completed: boolean;
  stream: string[];
  metrics: GenerationMetrics;
  fallbackTriggered?: boolean;
  errors: string[];
}

export interface GenerationMetrics {
  tokensPerSecond: number;
  latencyP95: number;
  peerChurn: PeerChurnMetrics;
  timestamp: string;
}

export interface PeerChurnMetrics {
  joins: number;
  leaves: number;
  totalPeers: number;
}

export interface AuditLogEntry {
  event: string;
  timestamp: string;
  peerFingerprint?: string;
  peerAddress?: string;
  reason?: string;
  peerCount?: number;
  modelName?: string;
  tokens?: number;
  duration?: number;
}

export interface PeerHealth {
  peers: PeerStatus[];
  timestamp: string;
}

export interface PeerStatus {
  address: string;
  status: 'active' | 'idle' | 'disconnected' | 'unhealthy';
  lastSeen: string;
  responseTime: number;
  uptime: number;
  fingerprint: string;
}

export interface PortStatus {
  openPorts: number[];
  timestamp: string;
  scanDuration: number;
}

export interface ClientLog {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  component: string;
}

export interface PetalsStatus {
  connected: boolean;
  peerCount: number;
  modelName: string;
  uptime: number;
  lastHealthCheck: string;
  localMode: boolean;
  federatedMode: boolean;
}

export interface MetricsStream {
  tokensPerSecond: number;
  latency: number;
  errorRate: number;
  peerCount: number;
  timestamp: string;
  modelName: string;
}

export interface ReplayMetrics {
  totalRequests: number;
  totalTokens: number;
  averageLatency: number;
  peerChurn: PeerChurnMetrics;
  errors: string[];
  fallbacks: number;
}

export interface PeerConnection {
  address: string;
  fingerprint: string;
  connectedAt: string;
  lastSeen: string;
  status: 'active' | 'idle' | 'disconnected' | 'unhealthy';
  bandwidth: number;
  latency: number;
}

export interface BandwidthUsage {
  current: number;
  limit: number;
  peak: number;
  average: number;
  timestamp: string;
}

export interface RateLimitStatus {
  requestsRemaining: number;
  tokensRemaining: number;
  resetTime: string;
  windowSize: number;
}

export interface SecurityEvent {
  type: 'peer_rejected' | 'bandwidth_exceeded' | 'rate_limit_exceeded' | 'unauthorized_access';
  timestamp: string;
  source: string;
  details: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
