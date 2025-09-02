import { describe, it, expect } from 'vitest';

describe('Endpoint Phase Consistency', () => {
  const endpoints = ['/status/version.json', '/api/healthz', '/api/readyz'];

  for (const endpoint of endpoints) {
    it(`should return phase: "stage0" for ${endpoint}`, async () => {
      // Test against local development server
      const response = await fetch(`http://localhost:3000${endpoint}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.phase).toBe('stage0');
    });
  }

  it('should have consistent phase across all endpoints', async () => {
    const phases: string[] = [];
    
    for (const endpoint of endpoints) {
      const response = await fetch(`http://localhost:3000${endpoint}`);
      const data = await response.json();
      phases.push(data.phase);
    }
    
    // All phases should be the same
    const uniquePhases = [...new Set(phases)];
    expect(uniquePhases).toHaveLength(1);
    expect(uniquePhases[0]).toBe('stage0');
  });
});
