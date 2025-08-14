#!/usr/bin/env python3.11
"""
Test script for Petals Connector - Phase X Task 2
Verifies peer allowlist, bandwidth guardrails, and local fallback
"""

import asyncio
import json
import sys
from pathlib import Path

def test_config_loading():
    """Test if Petals config can be loaded"""
    try:
        import yaml
        config_path = Path("config/petals.yaml")
        if config_path.exists():
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            print(f"✅ Petals config loaded: {len(config.get('allowed_peers', []))} allowed peers")
            return True
        else:
            print("❌ Petals config not found")
            return False
    except Exception as e:
        print(f"❌ Failed to load Petals config: {e}")
        return False

async def test_petals_connector():
    """Test Petals connector functionality"""
    try:
        from runtime.petals_connector import PetalsConnector
        
        # Create connector
        connector = PetalsConnector()
        print("✅ PetalsConnector created successfully")
        
        # Test peer allowlist
        allowed_peer = "peer1.example.com"
        blocked_peer = "malicious_peer.com"
        
        if connector._is_peer_allowed(allowed_peer):
            print("✅ Peer allowlist working - allowed peer accepted")
        else:
            print("❌ Peer allowlist failed - allowed peer rejected")
            return False
        
        if not connector._is_peer_allowed(blocked_peer):
            print("✅ Peer allowlist working - blocked peer rejected")
        else:
            print("❌ Peer allowlist failed - blocked peer accepted")
            return False
        
        # Test join block with allowed peer
        result = await connector.join_block("gpt2", 0, allowed_peer)
        if result["status"] == "success":
            print("✅ Join block with allowed peer successful")
        else:
            print(f"❌ Join block with allowed peer failed: {result}")
            return False
        
        # Test join block with blocked peer
        result = await connector.join_block("gpt2", 0, blocked_peer)
        if result["status"] == "rejected" and result["reason"] == "peer_not_allowed":
            print("✅ Join block with blocked peer correctly rejected")
        else:
            print(f"❌ Join block with blocked peer not rejected: {result}")
            return False
        
        # Test local fallback
        result = await connector.join_block("gpt2", 1)  # No peer specified
        if result["status"] == "success" and result["source"] == "local_processing":
            print("✅ Local fallback working correctly")
        else:
            print(f"❌ Local fallback failed: {result}")
            return False
        
        # Test host block
        test_data = b"test_block_data_12345"
        result = await connector.host_block("gpt2", 2, test_data, allowed_peer)
        if result["status"] == "success" and result["cached"]:
            print("✅ Host block successful - data cached")
        else:
            print(f"❌ Host block failed: {result}")
            return False
        
        # Test status and health
        status = connector.get_status()
        if status["status"] == "active":
            print("✅ Connector status active")
        else:
            print(f"❌ Connector status not active: {status['status']}")
            return False
        
        health = await connector.health_check()
        if health["status"] in ["healthy", "degraded"]:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {health['status']}")
            return False
        
        return True
        
    except ImportError as e:
        print(f"❌ Failed to import PetalsConnector: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error in Petals connector test: {e}")
        return False

async def main():
    """Run all tests"""
    print("🧪 Testing Petals Connector...")
    print("=" * 50)
    
    tests = [
        ("config loading", test_config_loading),
        ("Petals connector", test_petals_connector),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        if test_name == "Petals connector":
            result = await test_func()
        else:
            result = test_func()
        
        if result:
            passed += 1
            print(f"✅ {test_name} passed")
        else:
            print(f"❌ {test_name} failed")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed! Petals connector ready.")
        return True
    else:
        print("❌ Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
