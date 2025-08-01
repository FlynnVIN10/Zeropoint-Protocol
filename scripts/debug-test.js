#!/usr/bin/env node

import axios from 'axios';

async function debugTest() {
  console.log('🔍 Debug Test for Failed Endpoints');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Advanced Status with auth
    console.log('\n1. Testing /advanced/status with auth...');
    const authResponse = await axios.post('http://localhost:3000/v1/auth/login', {
      username: 'loadtest',
      password: 'loadtest123'
    });
    
    const token = authResponse.data.access_token;
    console.log('✅ Auth successful, token:', token.substring(0, 20) + '...');
    
    const advancedStatusResponse = await axios.get('http://localhost:3000/v1/advanced/status', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Advanced status response:', advancedStatusResponse.status);
    console.log('Response data:', JSON.stringify(advancedStatusResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Advanced status failed:', error.response?.status, error.response?.data);
  }
  
  try {
    // Test 2: Consensus Status without auth
    console.log('\n2. Testing /consensus/status without auth...');
    const consensusResponse = await axios.get('http://localhost:3000/v1/consensus/status', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Consensus status response:', consensusResponse.status);
    console.log('Response data:', JSON.stringify(consensusResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Consensus status failed:', error.response?.status, error.response?.data);
  }
}

debugTest().catch(console.error); 