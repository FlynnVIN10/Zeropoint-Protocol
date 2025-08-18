import { expect, vi } from 'vitest';

// Mock WebSocket globally
global.WebSocket = class MockWebSocket {
  url: string;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN
  }

  send(data: string) {
    // Mock implementation
  }

  close() {
    // Mock implementation
  }
} as any;
