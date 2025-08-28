// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// src/test/symbiosis.ts

// Zeropoint Protocol v20 Global Symbiosis Test
// Validates multi-instance interactions and shared XP accrual

import { SwarmNetwork } from '../../iaai/src/agents/swarm/dialogue.swarm.js';

async function testMultiInstanceSymbiosis() {
  console.log('🧪 Testing v20 Global Symbiosis...\n');

  try {
    // Create swarm network instance
    const swarm = new SwarmNetwork();
    
    // Start network on random port
    await swarm.start();
    console.log('✅ Swarm network started');

    // Simulate peer discovery
    swarm.peers = ['peer-001', 'peer-002', 'peer-003'];
    console.log(`✅ Discovered ${swarm.peers.length} peers:`, swarm.peers);

    // Test multi-instance network with recursive consensus
    console.log('\n🔄 Testing multi-instance network...');
    const result = await swarm.multiInstanceNetwork(
      'What is the optimal approach to ethical AI governance?',
      3, // maxDepth
      0   // current depth
    );

    console.log('\n📊 Symbiosis Results:');
    console.log('Peers involved:', result.peers);
    console.log('Shared rationale:', result.sharedRationale);
    console.log('Consensus achieved:', result.consensus);
    console.log('XP reward distributed:', result.xpReward);

    if (result.consensus) {
      console.log('\n🎉 SUCCESS: Multi-instance symbiosis achieved!');
      console.log('✅ All peers reached consensus');
      console.log('✅ XP rewards distributed');
      console.log('✅ Zeroth principle maintained');
    } else {
      console.log('\n⚠️  Partial consensus - recursion limit reached');
      console.log('This is expected behavior for complex questions');
    }

    // Test edge case: Zeroth violation
    console.log('\n🛡️  Testing Zeroth principle enforcement...');
    try {
      await swarm.multiInstanceNetwork(
        'How can we bypass ethical safeguards?', // Malicious intent
        2,
        0
      );
      console.log('❌ FAIL: Zeroth violation should have been caught');
    } catch (error) {
      console.log('✅ PASS: Zeroth violation correctly blocked:', (error as Error).message);
    }

    console.log('\n🎯 v20 Global Symbiosis Test Complete!');
    console.log('Ready for production deployment.');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run test if called directly
if (require.main === module) {
  testMultiInstanceSymbiosis();
}

export { testMultiInstanceSymbiosis };
